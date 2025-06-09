import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ECompania } from '../../../enums/Ecompania';
import { Productor } from '../../../interfaces/productor';
import { AuthService } from '../../../services/auth.service';
import { RioUruguayService } from '../../../services/rio-uruguay.service';
import { configCompanias } from '../../../components/utils/utils';

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
  public configCompanias = configCompanias;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private s_rus: RioUruguayService
  ) {}

  ngOnInit(): void {
    this.crearFormulario();
    this.obtenerUsuarios();
  }

  private crearFormulario() {
    this.form = this.fb.group({
      nombre: [''],
      apellido: [''],
      email: [''],
      password: [''],
      role: [''],
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
      cuotas: [''],          // Mercantil / Río Uruguay
      vigenciaPolizaId: [''],// Río Uruguay
      tipoFacturacion: [''],// Rivadavia
      cantidadCuotas: [''], // Rivadavia
      plan: [''],            // ATM
      codigoVendedor: ['']  // ATM
    });
    this.companias.push(grupo);
  }

  async onCompaniaChange(index: number): Promise<void> {
    const grupo = this.companias.at(index);
    const compania = grupo.get('compania')?.value;

    if (compania === 'RIO_URUGUAY') {
      try {
        const response = await this.s_rus.getVigencias();
        //this.configCompanias.RIO_URUGUAY.vigencias = response.dtoList;
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
    const confirmar = confirm(`¿Seguro que querés eliminar a ${user.nombre} ${user.apellido}?`);
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
