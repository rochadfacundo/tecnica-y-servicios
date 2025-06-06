import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ECompania } from '../../../enums/Ecompania';
import { Productor } from '../../../interfaces/productor';
import { AuthService } from '../../../services/auth.service';

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

  constructor(private fb: FormBuilder, private authService: AuthService) {}

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
      refacturacion: [''],
      vigencia: [''],
      ajuste: [''],
    });
    this.companias.push(grupo);
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

  guardar() {
    console.log(this.form.value);
    // Acá iría el servicio para guardar en backend
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

    this.companias.clear();
    if (user.companias?.length) {
      user.companias.forEach(c => {
        this.companias.push(this.fb.group({
          compania: [c.compania],
          nroProductor: [c.nroProductor],
          claveProductor: [c.claveProductor],
          refacturacion: [c.refacturacion],
          vigencia: [c.vigencia],
          ajuste: [c.ajuste]
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
