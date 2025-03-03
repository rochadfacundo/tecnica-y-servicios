import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RioUruguayService } from '../../services/rio-uruguay.service';
import { CotizacionRioUruguay, RusCotizado, VehiculosRus } from '../../interfaces/cotizacionRioUruguay';
import { CotizacionMercantil } from '../../interfaces/cotizacionMercantil';

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
  gnc:boolean=false;
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

  public readonly clausulasAjuste=
  [
    { id: 0, nombre: '0%' },
    { id: 10, nombre: '10%' },
    { id: 20, nombre: '20%' },
    { id: 30, nombre: '30%'}
  ];

  public readonly tiposDeUso=
  [
    { id: 1, uso: 'PARTICULAR' },
    { id: 2, uso: 'COMERCIAL' },
  ];

  private getTiposUso(id: number): string {
    const tipoUso = this.tiposDeUso.find(item => item.id === id);
    return tipoUso ? tipoUso.uso : 'PARTICULAR';
  }

  public readonly opcionesSiNo = [
    { id: 1, opcion: 'SI' },
    { id: 2, opcion: 'NO' }
  ];

  public readonly tiposVigencia = [
    { id: 1, opcion: 'TRIMESTRAL' },
    { id: 2, opcion: 'SEMESTRAL' },
    { id: 3, opcion: 'ANUAL' }
  ];

  private getTiposVigencia(id: number): string {
    const tipoVigencia = this.tiposVigencia.find(item => item.id === id);
    return tipoVigencia ? tipoVigencia.opcion : 'ANUAL';
  }

  public readonly condicionesFiscales = [
    { id: 1, condicion: 'CF', descripcion: 'Consumidor final'},
    { id: 2, condicion: 'EX', descripcion: 'Exento'},
    { id: 3, condicion: 'FM', descripcion: 'Resp. Inscp. Fac. M'},
    { id: 4, condicion: 'GC', descripcion: 'Gran contribuyente'},
    { id: 5, condicion: 'RI', descripcion: 'Responsable inscripto'},
    { id: 6, condicion: 'RMT', descripcion: 'Responsable monotributo'},
    { id: 7, condicion: 'RNI', descripcion: 'No inscripto'},
    { id: 8, condicion: 'SSF', descripcion: 'Sin situación fiscal'},
    { id: 9, condicion: 'CDE', descripcion: 'Cliente del exterior'}
  ];

  private getCondicionFiscal(id: number): string {
    const condicion = this.condicionesFiscales.find(cf => cf.id === id);
    return condicion ? condicion.condicion : 'CF';
  }


  constructor(
    @Inject(RioUruguayService) private s_rus: RioUruguayService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadYears();
    this.setupValueChanges();
  }



  private getSiNo(id: number): string {
    return id === 1 ? 'SI' : 'NO';
  }

  private initForm(): void {
    this.cotizacionForm = this.fb.group({
      codigoTipoInteres: [{value:null}],
      tipoVehiculo: [{ value: null, disabled: true }],
      marca: [{ value: null, disabled: true }],
      anio: [{ value: null, disabled: true }],
      modelo: [{ value: null, disabled: true }],
      version: [{ value: null, disabled: true }],
      uso: [{ value: null}],
      codigoUso: [{ value: null, disabled: true }],
      tipoVigencia:[{value:null}],
      cuotas:[{value:null}],
      clausulaAjuste: [{value:null}],
      condicionFiscal:[{value:null}],
      cpLocalidadGuarda:[{value:null}],
      controlSatelital:[{value:null}],
      gnc:[{value:null}],
      vigenciaDesde:[this.formatDate(new Date())],
      vigenciaHasta:[{value:null}]

    });
  }

  private setupValueChanges(): void {

    this.cotizacionForm.get('codigoTipoInteres')?.valueChanges.subscribe((tipo) => {

      if (tipo==1) {
        this.cotizacionForm.get('tipoVehiculo')?.enable();
      } else {
        this.cotizacionForm.get('tipoVehiculo')?.disable();
      }
    });

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

  // Función para formatear la fecha en 'yyyy-MM-dd'
  private formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Agregar 0 si es necesario
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
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
        console.log(this.modelos);
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


  cotizar()
  {
    this.cotizarRUS();

   // this.cotizarMercantil();
  }


  cotizarMercantil()
  {
    const formValues = this.cotizacionForm.value;

    const getGNC= this.getSiNo(formValues.gnc);

    if(getGNC=='SI')
    {
      this.gnc=true;
    }else
    {
      this.gnc=false;
    }

    const cotizacionData: CotizacionMercantil = {
      canal: 78,
      localidad: { codigo_postal: Number(formValues.cpLocalidadGuarda) },
      vehiculo:
      { infoauto: 170761,
        anio: formValues.anio,
        uso: 1,
        gnc: this.gnc,
        rastreo: 0 },
      productor: { id: 86322 }
    };
  }

  cotizarRUS(): void {
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
        uso: this.getTiposUso(formValues.uso)
    }];

    const cotizacionData: CotizacionRioUruguay = {
      codigoProductor: 4504,
      codigoSolicitante: 4504,
      codigoTipoInteres: this.getTipo(formValues.tipoVehiculo),
      cuotas: Number(formValues.cuotas),
      ajusteAutomatico:Number(formValues.clausulaAjuste),
      condicionFiscal: this.getCondicionFiscal(formValues.condicionFiscal),
      tipoVigencia: this.getTiposVigencia(formValues.tipoVigencia),
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
