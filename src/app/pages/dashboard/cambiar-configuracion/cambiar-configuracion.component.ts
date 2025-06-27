import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { configCompanias } from '../../../utils/utils';
import { Productor } from '../../../models/productor.model';
import { AuthService } from '../../../services/auth.service';
import { getStorage, uploadBytesResumable, getDownloadURL, ref } from '@angular/fire/storage';
import { RioUruguayService } from '../../../services/rio-uruguay.service';

@Component({
  selector: 'app-cambiar-configuracion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './cambiar-configuracion.component.html',
  styleUrl: './cambiar-configuracion.component.css'
})
export class CambiarConfiguracionComponent implements OnInit {
  form!: FormGroup;
  fotoSeleccionada: File | null = null;
  fotoUrl: string | null = null;
  configCompanias = configCompanias;
  productorLogueado: Productor | null = null;
  modoEdicion: boolean = false;
  datosOriginales!: Productor;
  user: Productor|null=null;

  private fb = inject(FormBuilder);
  private s_auth = inject(AuthService);
  private s_rus = inject(RioUruguayService);

  ngOnInit() {
    this.crearFormulario();
    this.cargarDatosUsuario();
  }

  crearFormulario() {
    this.form = this.fb.group({
      nombre: [''],
      apellido: [''],
      email: [''],
      path: [''],
      companias: this.fb.array([]),
    });

    if (!this.modoEdicion) {
      this.form.get('nombre')?.disable();
      this.form.get('apellido')?.disable();
      this.form.get('email')?.disable();
    }
  }

  get companias(): FormArray {
    return this.form.get('companias') as FormArray;
  }

  onFotoSeleccionada(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input.files?.length) {
    this.fotoSeleccionada = input.files[0];

    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.fotoUrl = e.target.result;
    };
    reader.readAsDataURL(this.fotoSeleccionada);
  }
}


  actualizarCantidadCuotasRivadavia(index: number): void {
    const grupo = this.companias.at(index);
    const tipo = grupo.get('tipoFacturacion')?.value;

    const mapa: Record<'CUATRIMESTRAL' | 'ANUAL' | 'SEMESTRAL' | 'TRIMESTRAL' | 'MENSUAL', string> = {
      CUATRIMESTRAL: '4',
      ANUAL: '12',
      SEMESTRAL: '6',
      TRIMESTRAL: '3',
      MENSUAL: '1',
    };

    const cantidadCuotas = (tipo && tipo in mapa) ? mapa[tipo as keyof typeof mapa] : '';
    grupo.get('cantidadCuotas')?.setValue(cantidadCuotas);
  }

  actualizarCuotasMercantil(index: number): void {
    const grupo = this.companias.at(index);
    const periodo = grupo.get('periodo')?.value;
    grupo.get('cuotas')?.setValue(periodo);
  }

  actualizarCuotasRioUruguay(index: number): void {
    const grupo = this.companias.at(index);
    const vigenciaId = Number(grupo.get('vigenciaPolizaId')?.value);

    const vigencias = this.configCompanias['RIO URUGUAY'].vigencias;
    const seleccionada = vigencias.find((v: any) => v.id === vigenciaId);

    if (seleccionada) {
      grupo.get('cuotas')?.setValue(seleccionada.cantidadMesesFacturacion);
    }
  }

  alternarModoEdicion() {
    this.modoEdicion = !this.modoEdicion;

    if (this.modoEdicion) {
      this.form.get('nombre')?.enable();
      this.form.get('apellido')?.enable();
      this.form.get('email')?.enable()

      this.companias.controls.forEach(grupo => {
        grupo.get('nroProductor')?.enable();
        grupo.get('claveProductor')?.enable();
        grupo.get('tipoFacturacion')?.enable();
        grupo.get('periodo')?.enable();
        grupo.get('refacturaciones')?.enable();
        grupo.get('vigenciaPolizaId')?.enable();
        grupo.get('codigoVendedor')?.enable();
        grupo.get('plan')?.enable();
      });
    } else {
      this.companias.clear();
      this.cargarDatosUsuario();
    }
  }

  async cargarDatosUsuario() {
    this.user = await this.s_auth.obtenerProductorLogueado();
    if (!this.user) return;
;
    try {
      const vigencias = await this.s_rus.getVigencias().pipe().toPromise();
      this.configCompanias['RIO URUGUAY'].vigencias = vigencias;
    } catch (error) {
      console.error('❌ Error al obtener vigencias de Río Uruguay', error);
    }

    this.productorLogueado = this.user;
    this.datosOriginales = JSON.parse(JSON.stringify(this.user));
    this.fotoUrl = this.user.path || null;

    this.form.patchValue({
      nombre: this.user.nombre,
      apellido: this.user.apellido,
      email: this.user.email,
      path: this.user.path
    });

    if (this.user.companias?.length) {
      this.user.companias.forEach(c => {
        const grupo = this.fb.group({
          compania: [c.compania],
          nroProductor: [c.nroProductor],
          claveProductor: [c.claveProductor],
          refacturaciones: [c.refacturaciones ?? null],
          periodo: [c.periodo],
          cuotas: [{ value: c.cuotas, disabled: true }],
          vigenciaPolizaId: [c.vigenciaPolizaId],
          tipoFacturacion: [c.tipoFacturacion],
          cantidadCuotas: [{ value: c.cantidadCuotas, disabled: true }],
          plan: [c.plan],
          codigoVendedor: [c.codigoVendedor],
        });

        this.companias.push(grupo);

        if (c.compania === 'RIVADAVIA') {
          const tipo = c.tipoFacturacion;
          const mapa: Record<'CUATRIMESTRAL' | 'ANUAL' | 'SEMESTRAL' | 'TRIMESTRAL' | 'MENSUAL', string> = {
            CUATRIMESTRAL: '4',
            ANUAL: '12',
            SEMESTRAL: '6',
            TRIMESTRAL: '3',
            MENSUAL: '1'
          };
          const cantidadCuotas = (tipo && tipo in mapa) ? mapa[tipo as keyof typeof mapa] : '';
          grupo.get('cantidadCuotas')?.setValue(cantidadCuotas);
        }

        if (c.compania === 'MERCANTIL ANDINA') {
          grupo.get('cuotas')?.setValue(c.periodo);
        }

        if (c.compania === 'RIO URUGUAY') {
          const vigencia = this.configCompanias['RIO URUGUAY'].vigencias.find((v: any) => v.id === Number(c.vigenciaPolizaId));
          if (vigencia) {
            grupo.get('cuotas')?.setValue(vigencia.cantidadMesesFacturacion);
          }
        }

        if (!this.modoEdicion) {
          grupo.get('nroProductor')?.disable();
          grupo.get('claveProductor')?.disable();
          grupo.get('tipoFacturacion')?.disable();
          grupo.get('periodo')?.disable();
          grupo.get('refacturaciones')?.disable();
          grupo.get('vigenciaPolizaId')?.disable();
          grupo.get('codigoVendedor')?.disable();
          grupo.get('plan')?.disable();
        }
      });
    }
  }

  async guardarCambios() {
    if (this.form.invalid) return;

    const productor: Productor = this.form.getRawValue();
    productor.uid = this.productorLogueado?.uid;
    productor.role = this.productorLogueado?.role;
    productor.cotizaciones = this.productorLogueado?.cotizaciones;

    if (this.fotoSeleccionada && productor.email) {
      try {
        const storage = getStorage();
        const prefijo = productor.email.split('@')[0];
        const ruta = `usuarios/${prefijo}.png`;
        const storageRef = ref(storage, ruta);
        await uploadBytesResumable(storageRef, this.fotoSeleccionada);
        const url = await getDownloadURL(storageRef);
        productor.path = url;
      } catch (err) {
        console.error('Error al subir foto', err);
      }
    }

    try {
      await this.s_auth.updateUser(productor);
      this.s_auth.actualizarProductorLocal(productor);

      this.datosOriginales = JSON.parse(JSON.stringify(productor));
      this.modoEdicion = false;
      alert('✅ Cambios guardados correctamente');
    } catch (err) {
      console.error(err);
      alert('❌ Error al guardar cambios');
    }
  }
}
