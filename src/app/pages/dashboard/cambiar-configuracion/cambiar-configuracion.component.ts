import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { configCompanias } from '../../../utils/utils';
import { Productor } from '../../../models/productor.model';
import { AuthService } from '../../../services/auth.service';
import { getStorage, uploadBytesResumable, getDownloadURL, ref } from '@angular/fire/storage';
import { RioUruguayService } from '../../../services/rio-uruguay.service';
import { ETipoVehiculo } from '../../../enums/tipoVehiculos';
import { firstValueFrom } from 'rxjs';
import { VigenciaRus } from '../../../interfaces/cotizacionRioUruguay';
import { SpinnerService } from '../../../services/spinner.service';
import { ESpinner } from '../../../enums/ESpinner';
import { ToastrService } from 'ngx-toastr';

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
  user: Productor | null = null;
  animar:boolean=false;
  vigenciasRusAuto: VigenciaRus[] = [];
  vigenciasRusMoto: VigenciaRus[] = [];

  private fb = inject(FormBuilder);
  private s_auth = inject(AuthService);
  private s_rus = inject(RioUruguayService);
  private s_spinner= inject(SpinnerService);
  private s_toast= inject(ToastrService);

  ngOnInit() {

    this.crearFormulario();
    this.cargarDatosUsuario();
    setTimeout(() => {
      this.animar = true;
    }, 10);
  }

  crearFormulario() {
    this.form = this.fb.group({
      nombre: new FormControl({ value: '', disabled: true }, Validators.required),
      apellido: new FormControl({ value: '', disabled: true }, Validators.required),
      email: new FormControl({ value: '', disabled: true }),
      path: [''],
      companias: this.fb.array([]),
    });
  }

  get companias(): FormArray {
    return this.form.get('companias') as FormArray;
  }

  alternarModoEdicion() {
    this.modoEdicion = !this.modoEdicion;

    const controlesPrincipales = ['nombre', 'apellido', 'email'];
    controlesPrincipales.forEach(c => {
      const control = this.form.get(c);
      if (this.modoEdicion) control?.enable();
      else control?.disable();
    });

    this.companias.controls.forEach(grupo => {
      const grupoFG = grupo as FormGroup;
      Object.keys(grupoFG.controls).forEach(nombreControl => {
        const control = grupoFG.get(nombreControl);
        if (this.modoEdicion) control?.enable();
        else control?.disable();
      });
    });
  }

  onFotoSeleccionada(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.fotoSeleccionada = input.files[0];
      const reader = new FileReader();
      reader.onload = (e: any) => this.fotoUrl = e.target.result;
      reader.readAsDataURL(this.fotoSeleccionada);
    }
  }

  actualizarCantidadCuotasRivadavia(index: number): void {
    const grupo = this.companias.at(index);
    const tipo = grupo.get('tipoFacturacion')?.value;
    const mapa: Record<string, string> = {
      CUATRIMESTRAL: '4', ANUAL: '12', SEMESTRAL: '6', TRIMESTRAL: '3', MENSUAL: '1',
    };
    grupo.get('cantidadCuotas')?.setValue(mapa[tipo] || '');
  }

  actualizarCuotasMercantil(index: number): void {
    const grupo = this.companias.at(index);
    grupo.get('cuotas')?.setValue(grupo.get('periodo')?.value);
  }

  actualizarCuotasRioUruguay(index: number): void {
    const grupo = this.companias.at(index);

    const idAuto = Number(grupo.get('vigenciaPolizaIdAuto')?.value);
    const idMoto = Number(grupo.get('vigenciaPolizaIdMoto')?.value);

    const vigenciaAuto = this.vigenciasRusAuto.find(v => v.id === idAuto);
    const vigenciaMoto = this.vigenciasRusMoto.find(v => v.id === idMoto);

    if (vigenciaAuto) {
      grupo.get('cuotasAuto')?.setValue(vigenciaAuto.cantidadMesesFacturacion);
    }

    if (vigenciaMoto) {
      grupo.get('cuotasMoto')?.setValue(vigenciaMoto.cantidadMesesFacturacion);
    }
  }

  async cargarDatosUsuario() {
    this.user = await this.s_auth.obtenerProductorLogueado();
    if (!this.user) return;



    try {
      const [auto, moto] = await Promise.all([
        firstValueFrom(this.s_rus.getVigencias(ETipoVehiculo.VEHICULO)),
        firstValueFrom(this.s_rus.getVigencias(ETipoVehiculo.MOTOVEHICULO)),
      ]);
      this.vigenciasRusAuto = auto;
      this.vigenciasRusMoto = moto;
    } catch (error) {
      console.error('❌ Error al obtener vigencias de RUS:', error);
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
          nroProductor: new FormControl({ value: c.nroProductor, disabled: true }),
          claveProductor: new FormControl({ value: c.claveProductor, disabled: true }),
          refacturaciones: new FormControl({ value: c.refacturaciones ?? null, disabled: true }),
          periodo: new FormControl({ value: c.periodo, disabled: true }),
          cuotas: new FormControl({ value: c.cuotas, disabled: true }),
          cuotasAuto: new FormControl({ value: c.cuotasMoto, disabled: true }),
          cuotasMoto: new FormControl({ value: c.cuotasMoto, disabled: true }),
          vigenciaPolizaIdAuto: new FormControl({ value: c.vigenciaPolizaIdAuto, disabled: true }),
          vigenciaPolizaIdMoto: new FormControl({ value: c.vigenciaPolizaIdMoto, disabled: true }),
          tipoFacturacion: new FormControl({ value: c.tipoFacturacion, disabled: true }),
          cantidadCuotas: new FormControl({ value: c.cantidadCuotas, disabled: true }),
          plan: new FormControl({ value: c.plan, disabled: true }),
          codigoVendedor: new FormControl({ value: c.codigoVendedor, disabled: true })
        });

        this.companias.push(grupo);

        if (c.compania === 'RIVADAVIA') this.actualizarCantidadCuotasRivadavia(this.companias.length - 1);
        if (c.compania === 'MERCANTIL ANDINA') this.actualizarCuotasMercantil(this.companias.length - 1);
        if (c.compania === 'RIO URUGUAY') this.actualizarCuotasRioUruguay(this.companias.length - 1);
      });
    }
  }

  async guardarCambios() {
    if (this.form.invalid) return;
    const productor: Productor = this.form.getRawValue();
    productor.uid = this.productorLogueado?.uid;
    productor.role = this.productorLogueado?.role;
    productor.cotizaciones = this.productorLogueado?.cotizaciones;

    this.s_spinner.show(ESpinner.Vaiven);
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
      this.s_toast.success("Sus datos se modificaron exitosamente","Modificacion exitosa");

    } catch (err) {
      console.error(err);
      this.s_toast.success("Error al modificar sus datos, intente nuevamente","No se pudo modificar");
      alert('❌ ');
    }finally{
      this.s_spinner.hide(ESpinner.Vaiven);
    }
  }
}
