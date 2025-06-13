import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { configCompanias } from '../../../components/utils/utils';
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
  }

  get companias(): FormArray {
    return this.form.get('companias') as FormArray;
  }

  onFotoSeleccionada(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.fotoSeleccionada = input.files[0];
    }
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

  actualizarCuotasRioUruguay(index: number): void {
    const grupo = this.companias.at(index);
    const vigenciaId = Number(grupo.get('vigenciaPolizaId')?.value);

    const vigencias = this.configCompanias['RIO URUGUAY'].vigencias;
    const seleccionada = vigencias.find((v: any) => v.id === vigenciaId);

    if (seleccionada) {
      grupo.get('cuotas')?.setValue(seleccionada.cantidadMesesFacturacion);
    }
  }


  async cargarDatosUsuario() {
    const user = await this.s_auth.obtenerProductorLogueado();
    if (!user) return;

    // 🟢 Cargar vigencias de Río Uruguay
    try {
      const vigencias = await this.s_rus.getVigencias().pipe().toPromise(); // o firstValueFrom
      this.configCompanias['RIO URUGUAY'].vigencias = vigencias;
    } catch (error) {
      console.error('❌ Error al obtener vigencias de Río Uruguay', error);
    }

    this.productorLogueado = user;
    this.fotoUrl = user.path || null;

    this.form.patchValue({
      nombre: user.nombre,
      apellido: user.apellido,
      email: user.email,
      path: user.path
    });

    if (user.companias?.length) {
      user.companias.forEach(c => {
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

        // 🟡 Ajustes automáticos de cuotas
        if (c.compania === 'RIVADAVIA') {
          const tipo = c.tipoFacturacion;
          const mapa: Record<string, string> = {
            CUATRIMESTRAL: '4',
            ANUAL: '12',
            SEMESTRAL: '6',
            TRIMESTRAL: '3',
            MENSUAL: '1',
          };

          const cantidadCuotas = tipo && mapa[tipo] ? mapa[tipo] : '';
          grupo.get('cantidadCuotas')?.setValue(cantidadCuotas);
        }


        if (c.compania === 'MERCANTIL ANDINA') {
          const periodo = c.periodo;
          grupo.get('cuotas')?.setValue(periodo);
        }

        if (c.compania === 'RIO URUGUAY') {
          const vigencias = this.configCompanias['RIO URUGUAY'].vigencias;
          const seleccionada = vigencias.find((v: any) => v.id === Number(c.vigenciaPolizaId));
          if (seleccionada) {
            grupo.get('cuotas')?.setValue(seleccionada.cantidadMesesFacturacion);
          }
        }
      });
    }
  }

  async guardarCambios() {
    if (this.form.invalid) return;

    const productor: Productor = this.form.value;
    productor.uid = this.productorLogueado?.uid;
    productor.role = this.productorLogueado?.role;
    productor.cotizaciones = this.productorLogueado?.cotizaciones;

    // Subir foto si fue seleccionada
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
      alert('✅ Cambios guardados correctamente');
    } catch (err) {
      console.error(err);
      alert('❌ Error al guardar cambios');
    }
  }
}
