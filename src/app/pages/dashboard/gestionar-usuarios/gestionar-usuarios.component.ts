import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ECompania } from '../../../enums/Ecompania';
import { AuthService } from '../../../services/auth.service';
import { RioUruguayService } from '../../../services/rio-uruguay.service';
import { configCompanias, getRoles } from '../../../utils/utils';
import { firstValueFrom } from 'rxjs';
import { Productor } from '../../../models/productor.model';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from '@angular/fire/storage';
import {Role} from '../../../enums/role';

@Component({
  selector: 'app-gestionar-usuarios',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './gestionar-usuarios.component.html',
})
export class GestionarUsuariosComponent implements OnInit {
  form!: FormGroup;
  usuarios: Productor[]=[];
  companiasDisponibles: string[] = Object.values(ECompania);
  agregandoCompania = false;
  editandoCompaniaIndex: number | null = null;
  fotoSeleccionada: File | null = null;
  public configCompanias = configCompanias;
  roles:string[]=[];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private s_rus: RioUruguayService
  ) {
  }

  ngOnInit(): void {
    this.crearFormulario();
    this.obtenerUsuarios();
    this.roles= getRoles();
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
      refacturaciones: [''], // Federación
      periodo: [''],         // Mercantil
      cuotas: [{ value: '', disabled: true }],   // Mercantil / Río Uruguay
      vigenciaPolizaId: [''],// Río Uruguay
      tipoFacturacion: [''],// Rivadavia
      cantidadCuotas: [''], // Rivadavia
      plan: [''],            // ATM
      codigoVendedor: ['']  // ATM
    });
    this.companias.push(grupo);
  }

  actualizarCuotasRioUruguay(index: number): void {
    const grupo = this.companias.at(index);
    const vigenciaId = Number(grupo.get('vigenciaPolizaId')?.value); // ⚠️ importante

    const vigencias = this.configCompanias['RIO URUGUAY'].vigencias;
    const seleccionada = vigencias.find((v: any) => v.id === vigenciaId);

    if (seleccionada) {
      const control = grupo.get('cuotas');
      control?.setValue(seleccionada.cantidadMesesFacturacion);;
    }
  }


  async onCompaniaChange(index: number): Promise<void> {
    const grupo = this.companias.at(index);
    const compania = grupo.get('compania')?.value;

    if (compania === 'RIO URUGUAY') {
      try {
        const response = await firstValueFrom(this.s_rus.getVigencias());
        console.log(response);
        this.configCompanias['RIO URUGUAY'].vigencias = response;
      } catch (error) {
        console.error('❌ Error al cargar vigencias de Río Uruguay', error);
      }
    }

    grupo.patchValue({
      refacturaciones: '',
      periodo: '',
      cuotas: '',
      vigenciaPolizaId: '',
      tipoFacturacion: '',
      cantidadCuotas: '',
      plan: '',
      codigoVendedor: ''
    });
  }

  guardar() {}

  getClaveRefacturacion(valor: any): string {
    const mapa = configCompanias['FEDERACION PATRONAL'].refacturaciones;
    for (const clave in mapa) {
      if (Number(mapa[clave]) === Number(valor)) return clave;
    }
    return '';
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
      this.usuarios = await this.authService.getAllUsers();
    } catch (error) {
      console.error('❌ Error al obtener usuarios', error);
    }
  }

  editarUsuario(user: Productor) {
    this.form.patchValue({
      nombre: user.nombre,
      apellido: user.apellido,
      email: user.email,
      password: '',
      role: user.role
    });
  // 🔒 Desactivar campo de contraseña
  this.form.get('password')?.disable();
    this.companias.clear();
    if (user.companias?.length) {
      user.companias.forEach(c => {
        this.companias.push(this.fb.group({
          compania: [c.compania],
          nroProductor: [c.nroProductor],
          claveProductor: [c.claveProductor],
          refacturaciones: [c.refacturaciones ?? null],
          periodo: [c.periodo],
          cuotas: [c.cuotas],
          vigenciaPolizaId: [c.vigenciaPolizaId],
          tipoFacturacion: [c.tipoFacturacion],
          cantidadCuotas: [c.cantidadCuotas],
          plan: [c.plan],
          codigoVendedor: [c.codigoVendedor],
        }));
      });
    }
  }

  prepararEliminacion(user: Productor) {
    const confirmar = confirm(`¿Seguro que querés eliminar a ${user.nombre}?`);
    if (confirmar && user.uid) {
      this.authService.deleteUser(user.uid).then(() => {
        this.obtenerUsuarios();
        alert('🗑️ Usuario eliminado correctamente');
      }).catch(error => {
        alert('❌ Error al eliminar usuario');
        console.error(error);
      });
    }
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

    // Subir foto si fue seleccionada
    if (this.fotoSeleccionada && productor.email) {
      try {
        const storage = getStorage(); // ✅ Usar getStorage() directamente
        const email = productor.email.split('@')[0]; // prefijo del email
        const ruta = `usuarios/${email}.png`;
        const storageRef = ref(storage, ruta);

        await uploadBytesResumable(storageRef, this.fotoSeleccionada);
        const downloadUrl = await getDownloadURL(storageRef);
        productor.path = downloadUrl; // ✅ se asigna acá
        console.log('📸 Foto subida:', downloadUrl);
      } catch (error) {
        console.error('❌ Error al subir foto de perfil:', error);
      }
    }

    try {
      await this.authService.register(productor);
      alert('✅ Productor registrado correctamente');
      this.form.reset();
      this.companias.clear();
      this.obtenerUsuarios();
    } catch (error) {
      console.error('❌ Error al registrar productor:', error);
      alert('❌ No se pudo registrar el productor. Intentá nuevamente.');
    }
  }



}
