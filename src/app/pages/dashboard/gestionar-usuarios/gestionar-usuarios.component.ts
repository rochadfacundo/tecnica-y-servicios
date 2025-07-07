import { Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ECompania } from '../../../enums/Ecompania';
import { AuthService } from '../../../services/auth.service';
import { RioUruguayService } from '../../../services/rio-uruguay.service';
import { configCompanias, getRoles } from '../../../utils/utils';
import { firstValueFrom } from 'rxjs';
import { Productor } from '../../../models/productor.model';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from '@angular/fire/storage';
import { Role } from '../../../enums/role';
import { TipoVehiculo } from '../../../enums/tipoVehiculos';
import { SpinnerService } from '../../../services/spinner.service';
import { ESpinner } from '../../../enums/ESpinner';

@Component({
  selector: 'app-gestionar-usuarios',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './gestionar-usuarios.component.html',
})
export class GestionarUsuariosComponent implements OnInit {
  form!: FormGroup;
  usuarios: Productor[] = [];
  companiasDisponibles: string[] = Object.values(ECompania);
  agregandoCompania = false;
  editandoCompaniaIndex: number | null = null;
  fotoSeleccionada: File | null = null;
  public configCompanias = configCompanias;
  roles: string[] = [];
  vigenciasRusAuto: any[] = [];
  vigenciasRusMoto: any[] = [];
  vigenciasRusCargadas = false;
  showPassword = true;
  changePassword = false;



  constructor(
    private fb: FormBuilder,
    @Inject(AuthService) private s_auth: AuthService,
    @Inject(RioUruguayService) private s_rus: RioUruguayService,
    @Inject(SpinnerService) private s_spinner: SpinnerService,
  ){}

  async ngOnInit() {
    this.crearFormulario();
    this.obtenerUsuarios();
    this.roles = getRoles();
  }

  onFotoSeleccionada(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.fotoSeleccionada = input.files[0];
    }
  }

  private crearFormulario() {
    this.form = this.fb.group({
      nombre: [''],
      apellido: [''],
      email: [''],
      password: [''],
      role: [Role.Productor],
      path: [''],
      companias: this.fb.array([]),
    });
  }

  get companias(): FormArray {
    return this.form.get('companias') as FormArray;
  }

  iniciarAgregarCompania(): void {
    this.agregandoCompania = true;
    const grupo = this.fb.group({
      compania: [''],
      nroProductor: [''],
      claveProductor: [''],
      refacturaciones: [''],
      periodo: [''],
      cuotas: [{ value: '', disabled: true }],
      cuotasAuto: [''],
      cuotasMoto: [''],
      vigenciaPolizaIdAuto: [''],
      vigenciaPolizaIdMoto: [''],
      tipoFacturacion: [''],
      cantidadCuotas: [''],
      plan: [''],
      codigoVendedor: ['']
    });
    this.companias.push(grupo);
  }

  actualizarCuotasRioUruguay(index: number): void {
    const grupo = this.companias.at(index);
    const idAuto = Number(grupo.get('vigenciaPolizaIdAuto')?.value);
    const idMoto = Number(grupo.get('vigenciaPolizaIdMoto')?.value);

    const vigenciaAuto = this.vigenciasRusAuto.find(v => v.id === idAuto);
    const vigenciaMoto = this.vigenciasRusMoto.find(v => v.id === idMoto);

    if (vigenciaAuto) grupo.get('cuotasAuto')?.setValue(vigenciaAuto.cantidadMesesFacturacion);
    if (vigenciaMoto) grupo.get('cuotasMoto')?.setValue(vigenciaMoto.cantidadMesesFacturacion);
  }

  async onCompaniaChange(index: number): Promise<void> {
    const grupo = this.companias.at(index);
    const compania = grupo.get('compania')?.value;

    if (compania === 'RIO URUGUAY') {
      await this.cargarVigenciasRus();
    }

    grupo.patchValue({
      refacturaciones: '',
      periodo: '',
      cuotas: '',
      vigenciaPolizaIdAuto: '',
      vigenciaPolizaIdMoto: '',
      tipoFacturacion: '',
      cantidadCuotas: '',
      plan: '',
      codigoVendedor: ''
    });
  }


reestablecerPassword(usuario: Productor) {
  const nuevaClave = prompt(`🔐 Ingresá la nueva contraseña para ${usuario.email}`);
  if (!nuevaClave) return;

  this.s_spinner.show(ESpinner.Rebote);
  this.s_auth.updatePassword(usuario.uid!, nuevaClave).subscribe({
    next: () => {
      alert('✅ Contraseña actualizada con éxito');
    },
    error: (err) => {
      console.error('❌ Error al reestablecer contraseña:', err);
      alert('❌ No se pudo actualizar la contraseña.');
    },
    complete: () => this.s_spinner.hide(ESpinner.Rebote)
  });
}


  actualizarCantidadCuotasRivadavia(index: number): void {
    const grupo = this.companias.at(index);
    const tipo = grupo.get('tipoFacturacion')?.value;

    const mapa: Record<string, string> = {
      CUATRIMESTRAL: '4',
      ANUAL: '12',
      SEMESTRAL: '6',
      TRIMESTRAL: '3',
      MENSUAL: '1',
    };

    grupo.get('cantidadCuotas')?.setValue(mapa[tipo] || '');
  }

  actualizarCuotasMercantil(index: number): void {
    const grupo = this.companias.at(index);
    const periodo = grupo.get('periodo')?.value;
    grupo.get('cuotas')?.setValue(periodo);
  }

  confirmarCompania(): void {
    this.agregandoCompania = false;
  }

  cancelarAgregarCompania(): void {
    this.companias.removeAt(this.companias.length - 1);
    this.agregandoCompania = false;
  }

  modificarCompania(index: number): void {
    this.editandoCompaniaIndex = index;
  }

  confirmarEdicionCompania(): void {
    this.editandoCompaniaIndex = null;
  }

  cancelarEdicionCompania(): void {
    this.editandoCompaniaIndex = null;
  }

  eliminarCompania(index: number): void {
    this.companias.removeAt(index);
    this.agregandoCompania = false;
    if (this.editandoCompaniaIndex === index) {
      this.editandoCompaniaIndex = null;
    }
  }

  async obtenerUsuarios() {
    try {
      this.usuarios = await this.s_auth.getAllUsers();
    } catch (error) {
      console.error('❌ Error al obtener usuarios', error);
    }
  }

  getDescripcionVigenciaRusAuto(id: any): string | null {
    const vigencia = this.vigenciasRusAuto.find(v => v.id == id);
    return vigencia ? `VIGENCIA: ${vigencia.descripcion} - FACTURACIÓN: ${vigencia.descripcionPeriodoFacturacion}` : null;
  }

  getDescripcionVigenciaRusMoto(id: any): string | null {
    const vigencia = this.vigenciasRusMoto.find(v => v.id == id);
    return vigencia ? `VIGENCIA: ${vigencia.descripcion} - FACTURACIÓN: ${vigencia.descripcionPeriodoFacturacion}` : null;
  }

  async editarUsuario(user: Productor) {
    this.form.patchValue({
      nombre: user.nombre,
      apellido: user.apellido,
      email: user.email,
      password: '',
      role: user.role,
      path:user.path,
    });
    this.form.get('password')?.disable();
    this.showPassword = false;
    this.companias.clear();

    for (const [index, c] of (user.companias ?? []).entries()) {
      if (c.compania === 'RIO URUGUAY') {
        await this.cargarVigenciasRus();
      }

      this.companias.push(this.fb.group({
        compania: [c.compania],
        nroProductor: [c.nroProductor],
        claveProductor: [c.claveProductor],
        refacturaciones: [c.refacturaciones ?? null],
        periodo: [c.periodo],
        cuotas: [c.cuotas],
        cuotasAuto: [c.cuotasAuto],
        cuotasMoto: [c.cuotasMoto],
        vigenciaPolizaIdAuto: [c.vigenciaPolizaIdAuto],
        vigenciaPolizaIdMoto: [c.vigenciaPolizaIdMoto],
        tipoFacturacion: [c.tipoFacturacion],
        cantidadCuotas: [c.cantidadCuotas],
        plan: [c.plan],
        codigoVendedor: [c.codigoVendedor],
      }));
    }
  }

  activarCampoPassword() {
    this.showPassword = true;
    this.changePassword = true;
    this.form.get('password')?.enable();
    this.form.get('password')?.setValue('');
  }


  async cargarVigenciasRus() {
    this.vigenciasRusCargadas = false;
    try {
      const [autos, motos] = await Promise.all([
        firstValueFrom(this.s_rus.getVigencias(TipoVehiculo.VEHICULO)),
        firstValueFrom(this.s_rus.getVigencias(TipoVehiculo.MOTOVEHICULO)),
      ]);
      this.vigenciasRusAuto = autos;
      this.vigenciasRusMoto = motos;
      this.configCompanias['RIO URUGUAY'].vigencias = [...autos, ...motos];
      this.vigenciasRusCargadas = true;
    } catch (error) {
      console.error('❌ Error al cargar vigencias de RUS:', error);
    }
  }


  prepararEliminacion(user: Productor) {
    const confirmar = confirm(`¿Seguro que querés eliminar a ${user.nombre}?`);
    if (confirmar && user.uid) {
      this.s_auth.deleteUser(user.uid).then(() => {
        this.obtenerUsuarios();
        alert('🗑️ Usuario eliminado correctamente');
      }).catch(error => {
        alert('❌ Error al eliminar usuario');
        console.error(error);
      });
    }
  }

  getClaveRefacturacion(valor: any): string {
    const mapa = configCompanias['FEDERACION PATRONAL'].refacturaciones;
    for (const clave in mapa) {
      if (Number(mapa[clave]) === Number(valor)) return clave;
    }
    return '';
  }

  getClavePeriodoMercantil(valor: any): string {
    const mapa = configCompanias['MERCANTIL ANDINA'].periodos;
    for (const clave in mapa) {
      if (Number(mapa[clave]) === Number(valor)) return clave;
    }
    return '';
  }

  getClaveTipoFacturacionRivadavia(valor: any): string {
    const mapa: Record<string, string> = {
      CUATRIMESTRAL: '4',
      ANUAL: '12',
      SEMESTRAL: '6',
      TRIMESTRAL: '3',
      MENSUAL: '1',
    };

    for (const clave in mapa) {
      if (mapa[clave] === String(valor)) return clave;
    }
    return '';
  }

  getDescripcionPlanATM(planCode: string): string {
    const planes = configCompanias['ATM'].planes;
    const plan = planes.find((p: { plan: string; }) => p.plan === planCode);
    return plan ? `${plan.descripcion} (${plan.formaPago})` : '';
  }

  getCompaniasFiltradas(index: number): string[] {
    const companiaActual = this.companias.at(index).get('compania')?.value;
    const seleccionadas = this.companias.value.map((v: any) => v.compania);
    return this.companiasDisponibles.filter(c =>
      !seleccionadas.includes(c) || c === companiaActual
    );
  }

  async confirmarProductor() {
    if (this.form.invalid) {
      alert('❌ El formulario contiene errores. Verificá todos los campos.');
      return;
    }

    const productor: Productor = this.form.value;

    if (this.fotoSeleccionada && productor.email) {
      try {
        const storage = getStorage();
        const email = productor.email.split('@')[0];
        const ruta = `usuarios/${email}.png`;
        const storageRef = ref(storage, ruta);

        await uploadBytesResumable(storageRef, this.fotoSeleccionada);
        const downloadUrl = await getDownloadURL(storageRef);
        productor.path = downloadUrl;
        console.log('📸 Foto subida:', downloadUrl);
      } catch (error) {
        console.error('❌ Error al subir foto de perfil:', error);
      }
    }


    try {
      this.s_spinner.show(ESpinner.Rebote);
      // Detectar si se está editando un usuario
      const yaExiste = this.usuarios.find(u => u.email === productor.email);

      if (yaExiste && yaExiste.uid) {
        if (yaExiste && yaExiste.uid) {
          productor.uid = yaExiste.uid;

           // Conservar la foto anterior si no se seleccionó una nueva
            if (!this.fotoSeleccionada) {
              productor.path = yaExiste.path;
            }

            if (this.changePassword) {
              const nuevaPassword = this.form.get('password')?.value;
              if (nuevaPassword) {
                await this.s_auth.updatePassword(productor.uid, nuevaPassword).toPromise();
              }
            }

          await this.s_auth.updateUser(productor);
          alert('✅ Productor actualizado correctamente');
        }

      } else {
        await this.s_auth.register(productor);
        alert('✅ Productor registrado correctamente');
      }
      this.obtenerUsuarios();
    } catch (error) {
      console.error('❌ Error al registrar productor:', error);
      alert('❌ No se pudo guardar el productor. Intentá nuevamente.');
    }finally{
      this.s_spinner.hide(ESpinner.Rebote);
      this.form.reset();
      this.companias.clear();
      this.fotoSeleccionada = null;
      this.editandoCompaniaIndex = null;
      this.agregandoCompania = false;

    }
  }

}
