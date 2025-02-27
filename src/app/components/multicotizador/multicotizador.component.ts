import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RioUruguayService } from '../../services/rio-uruguay.service';
import { CotizacionRioUruguay, RusCotizado, VehiculosRus } from '../../interfaces/cotizacionRioUruguay';

@Component({
  selector: 'app-multicotizador',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './multicotizador.component.html',
  styleUrl: './multicotizador.component.css'
})
export class MulticotizadorComponent implements OnInit {

  apiUrl = 'https://sandbox.sis.rus.com.ar/api-rus/vehiculos/gruposModelo';
  cotizacionForm!: FormGroup;
  marcas: any[] = [];
  anios: number[] = [];
  codModelo:number=0;
  modelos: any[] = [];
  versiones: any[] = [];
  usos: any[] = [];
  codigosUso: any[] = [];
  cotizacionesRus: RusCotizado[] = [];

  public readonly tiposVehiculo = [
    { id: 1, nombre: 'AUTO' },
    { id: 2, nombre: 'PICK-UP "A"' },
    { id: 3, nombre: 'PICK-UP "B"' },
    { id: 4, nombre: 'CAMION HASTA 5 TN' },
    { id: 5, nombre: 'CAMION HASTA 10 TN' },
    { id: 6, nombre: 'CAMION MAS 10 TN' },
    { id: 25, nombre: 'MOTORHOME' },
    { id: 26, nombre: 'M3 OMNIBUS' }
  ];

  private getTipo(id: number): string {
    const tipo = this.tipoInteresOpciones.find(cf => cf.id === id);
    return tipo ? tipo.nombre : 'VEHICULO';
  }

  public readonly tipoInteresOpciones=
  [
    { id: 1, nombre: 'VEHICULO' },
    { id: 2, nombre: 'MAQUINARIA' },
    { id: 3, nombre: 'ACOPLADOS' },
    { id: 4, nombre: 'TRAILERS'},
    { id: 5, nombre: 'IMPLEMENTOS'},
  ];

  public readonly opcionesSiNo = [
    { id: 1, opcion: 'SI' },
    { id: 2, opcion: 'NO' }
  ];

  public readonly condicionesFiscales = [
    { id: 1, condicion: 'CF' },
    { id: 2, condicion: 'EX' },
    { id: 3, condicion: 'FM' },
    { id: 4, condicion: 'GC' },
    { id: 5, condicion: 'RI' },
    { id: 6, condicion: 'RMT' },
    { id: 7, condicion: 'RNI' },
    { id: 8, condicion: 'SSF' },
    { id: 9, condicion: 'CDE' }
  ];

  constructor(
    @Inject(RioUruguayService) private s_rus: RioUruguayService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadYears();
    this.setupValueChanges();
  }

  private getCondicionFiscal(id: number): string {
    const condicion = this.condicionesFiscales.find(cf => cf.id === id);
    return condicion ? condicion.condicion : 'CF';
  }

  private getSiNo(id: number): string {
    return id === 1 ? 'SI' : 'NO';
  }

  private initForm(): void {
    this.cotizacionForm = this.fb.group({
      tipoVehiculo: [null],
      marca: [{ value: null, disabled: true }],
      anio: [{ value: null, disabled: true }],
      modelo: [{ value: null, disabled: true }],
      version: [{ value: null, disabled: true }],
      uso: [{ value: null, disabled: true }],
      codigoUso: [{ value: null, disabled: true }],
      codigoTipoInteres: [null],
      cuotas:[{value:null}],
      condicionFiscal:[{value:null}],
      cpLocalidadGuarda:[{value:null}],
      controlSatelital:[{value:null}],
      gnc:[{value:null}],
      vigenciaDesde:[{value:null}],
      vigenciaHasta:[{value:null}]

    });
  }

  private setupValueChanges(): void {
    this.cotizacionForm.get('tipoVehiculo')?.valueChanges.subscribe((tipo) => {
      if (tipo) {
        this.obtenerMarcas(tipo);
      } else {
        this.marcas = [];
        this.cotizacionForm.get('marca')?.disable();
      }
    });

    this.cotizacionForm.get('marca')?.valueChanges.subscribe((marca) => {
      this.cotizacionForm.get('anio')?.setValue(null);
      if (marca) {
        this.cotizacionForm.get('anio')?.enable();
      } else {
        this.cotizacionForm.get('anio')?.disable();
      }
    });

    this.cotizacionForm.get('anio')?.valueChanges.subscribe((anio) => {
      this.cotizacionForm.get('modelo')?.setValue(null);
      if (anio) {
        this.obtenerModelos();
      } else {
        this.modelos = [];
        this.cotizacionForm.get('modelo')?.disable();
      }
    });

    this.cotizacionForm.get('modelo')?.valueChanges.subscribe((modelo) => {
      this.cotizacionForm.get('version')?.setValue(null);
      if (modelo) {
        this.obtenerVersiones();
      } else {
        this.versiones = [];
        this.cotizacionForm.get('version')?.disable();
      }
    });
  }

  private loadYears(): void {
    const anioActual = new Date().getFullYear();
    this.anios = Array.from({ length: anioActual - 1989 }, (_, i) => anioActual - i);
  }

  private obtenerMarcas(tipo: number): void {
    this.s_rus.getMarcas(tipo).subscribe(
      (data: any) => {
        this.marcas = data.dtoList;
        this.cotizacionForm.get('marca')?.enable();
      },
      (error) => console.error('Error al obtener las marcas:', error)
    );
  }

  private obtenerModelos(): void {
    const { marca, anio } = this.cotizacionForm.value;
    if (!marca || !anio) return;

    this.s_rus.getModelos(marca, anio).subscribe(
      (data: any) => {
        this.modelos = data.dtoList;
        this.cotizacionForm.get('modelo')?.enable();
      },
      (error) => {
        console.error('Error al obtener los modelos:', error);
        this.modelos = [];
        this.cotizacionForm.get('modelo')?.disable();
      }
    );
  }

  onVersionChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const selectedValue = selectElement?.value?.trim(); // Trim para evitar espacios vacíos

    if (!selectedValue) {
      console.warn("⚠ No se seleccionó ninguna versión válida.");
      return;
    }

    const versionId = Number(selectedValue);

    if (isNaN(versionId)) {
      console.error("🚨 Error: El valor seleccionado no es un número válido.", selectedValue);
      return;
    }

    const versionSeleccionada = this.versiones.find(v => v.id === versionId);

    if (!versionSeleccionada) {
      console.error("⚠ La versión seleccionada no existe en la lista.");
      return;
    }

    console.log(versionSeleccionada);

    console.log("✅ Versión seleccionada:", versionSeleccionada);
    console.log(versionSeleccionada.id);
    this.codModelo=versionSeleccionada.id;
  }




  private obtenerVersiones(): void {
    const { modelo, anio, tipoVehiculo, marca } = this.cotizacionForm.value;
    if (!modelo) return;

    this.s_rus.getVersiones(modelo, anio, tipoVehiculo, marca).subscribe(
      (data: any) => {


        this.versiones = data.dtoList;
        console.log(this.versiones);
        this.cotizacionForm.get('version')?.enable();
      },
      (error) => {
        console.error('Error al obtener las versiones:', error);
        this.versiones = [];
        this.cotizacionForm.get('version')?.disable();
      }
    );
  }

  cotizar(): void {
    if (this.cotizacionForm.invalid) {
      console.warn('El formulario no es válido');
      return;
    }

    const formValues = this.cotizacionForm.value;


    const vehiculos: VehiculosRus[]=[{
        anio: String(formValues.anio),
        controlSatelital: this.getSiNo(formValues.controlSatelital),
        cpLocalidadGuarda:Number(formValues.cpLocalidadGuarda),
        gnc: this.getSiNo(formValues.gnc),
        modeloVehiculo: this.codModelo,
        uso: 'PARTICULAR'
    }];

    const cotizacionData: CotizacionRioUruguay = {
      codigoProductor: 4504,
      codigoSolicitante: 4504,
      codigoTipoInteres: this.getTipo(formValues.tipoVehiculo),
      cuotas: Number(formValues.cuotas),
      condicionFiscal: this.getCondicionFiscal(formValues.condicionFiscal),
      vehiculos: vehiculos,
      vigenciaDesde: formValues.vigenciaDesde,
      vigenciaHasta: formValues.vigenciaHasta,
      vigenciaPolizaId: 65
    };



    console.log(cotizacionData);


    this.s_rus.cotizar(cotizacionData).subscribe({
      next: (response) => {
        console.log('Cotización exitosa:', response);

        this.cotizacionesRus = response.dtoList;


    console.log('Cotizaciones procesadas:', this.cotizacionesRus);
      },
      error: (error) => {
        console.error('Error en la cotización:', error);
      }
    });
  }
}
