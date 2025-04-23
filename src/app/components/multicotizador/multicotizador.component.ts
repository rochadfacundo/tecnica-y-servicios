import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RioUruguayService } from '../../services/rio-uruguay.service';
import { CotizacionRioUruguay, RusCotizado, VehiculosRus } from '../../interfaces/cotizacionRioUruguay';
import { CotizacionLocalidad, CotizacionMercantil,CotizacionVehiculo,CotizacionVehiculoMoto,MercantilCotizado,Productor } from '../../interfaces/cotizacionMercantil';
import { MercantilAndinaService } from '../../services/mercantil-andina.service';
import { TipoDeUso } from '../../interfaces/tiposDeUso';
import { ChangeDetectorRef } from '@angular/core';
import { DashboardLayoutComponent } from '../../layouts/dashboard-layout/dashboard-layout.component';
import { InfoautoService } from '../../services/infoauto.service';
import { Brand, Group, Model } from '../../classes/infoauto';
@Component({
  selector: 'app-multicotizador',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './multicotizador.component.html',
  styleUrl: './multicotizador.component.css'
})
export class MulticotizadorComponent implements OnInit {

  cotizacionForm!: FormGroup;
  marcas: Brand[] = [];
  brand_idSelected:number=0;
  group_idSelected:number=0;
  anios: number[] = [];
  tipoVehiculo:string="";
  codigoTipoInteres:string='';
  codModelo:number=0;
  gnc:boolean=false;
  grupos: Group[] = [];
  modelos: Model[] = [];
  versiones: any[] = [];
  usos: any[] = [];
  codigosUso: any[] = [];
  cotizacionesRus: RusCotizado[] = [];
  cotizacion:boolean=true;
  cotizacionError:string='';
  tiposDeUso: TipoDeUso[]= [];

  constructor(
    @Inject(RioUruguayService) private s_rus: RioUruguayService,
    @Inject(MercantilAndinaService) private s_ma: MercantilAndinaService,
    @Inject(InfoautoService) private s_infoauto: InfoautoService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ){

  }

  ngOnInit(): void {
    this.initForm();
    this.loadYears();
    this.setupValueChanges();
  }

  public readonly tipoInteresOpciones=
  [
    { id: 1, nombre: 'VEHICULO' },
    { id: 2, nombre: 'MAQUINARIA' },
    { id: 3, nombre: 'ACOPLADOS' },
    { id: 4, nombre: 'TRAILERS'},
    { id: 5, nombre: 'IMPLEMENTOS'},
  ];

  public readonly cuotas=[1,2,3,4,5,6];

  public readonly clausulasAjuste=
  [
    { id: 0, nombre: '0%' },
    { id: 10, nombre: '10%' },
    { id: 20, nombre: '20%' },
    { id: 30, nombre: '30%'}
  ];

  public readonly opcionesSiNo = [
    { id: 1, opcion: 'SI' },
    { id: 2, opcion: 'NO' }
  ];

  public readonly tiposVigencia = [
    { id: 1, opcion: 'TRIMESTRAL' },
    { id: 2, opcion: 'SEMESTRAL' },
    { id: 3, opcion: 'ANUAL' }
  ];

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


  public readonly tiposVehiculo = [
    { id: 7, nombre: 'MOTO MENOS 50 CC' },
    { id: 8, nombre: 'MOTO MAS 50 CC' },
    { id: 1, nombre: 'AUTO' },
    { id: 2, nombre: 'PICK-UP "A"' },
    { id: 3, nombre: 'PICK-UP "B"' },
    { id: 4, nombre: 'CAMION HASTA 5 TN' },
    { id: 5, nombre: 'CAMION HASTA 10 TN' },
    { id: 6, nombre: 'CAMION MAS 10 TN' },
    { id: 25, nombre: 'MOTORHOME' },
    { id: 26, nombre: 'M3 OMNIBUS' },
  ];



  private getTipo(id: number): string {

    const idNumber =Number(id);
    let vehiculo='';

    switch (idNumber) {
      case 1:
      case 2:
      case 3:
      vehiculo='VEHICULO';
      break;
      case 4:
      case 5:
      case 6:
      vehiculo='CAMION';
        break;
      case 7:
      case 8:
      vehiculo='MOTOVEHICULO';
        break;
      case 25:
      vehiculo='MOTORHOME';
        break;
      case 26:
      vehiculo='OMNIBUS';
       break;

      default:
        break;
    }
    return vehiculo;
  }

  private setTiposUso(id: number) {


      switch (id) {
        case 1:   //auto
        case 2:   //pick-up A
        case 3:   //pick-up B
        case 7:   //Moto menos 50 CC
        case 8:   //Moto mas 50 CC
        case 25:   //MOTORHOME
          this.tiposDeUso=[
            {id: 1, uso: 'PARTICULAR',desc: 'PARTICULAR'},
            {id: 22, uso: 'COMERCIAL',desc: 'COMERCIAL'}
          ];

          break;
        case 4:    //CAMION HASTA 5 TN
        case 5:    //CAMION HASTA 10 TN
        case 6:    //CAMION MAS DE 10 TN
        this.tiposDeUso=[
          {id: 2, uso: 'AGCIA. DE ALQUILER S/CHOFER',  desc:"AGCIA. DE ALQUILER S/CHOFER-COMERCIAL"},
          {id: 3, uso: 'AUTOBOMBA', desc: 'AUTOBOMBA'},
          {id: 4, uso: 'AUXILIO MECANICO', desc: 'AUXILIO MECANICO-COMERCIAL'},
          {id: 5, uso: 'BOMBERO', desc: 'BOMBERO'},
          {id: 6, uso: 'POLICIAL', desc: 'POLICIAL'},
          {id: 7, uso: 'PORTAVOLQUETE', desc: 'PORTAVOLQUETE'},
          {id: 8, uso: 'RADIO URBANO (NO > A 100KM)', desc: 'RADIO URBANO (NO > A 100KM)-COMERCIAL'},
          {id: 9, uso: 'TRANS. PROD. ALIMENTICIOS', desc: 'TRANS. PROD. ALIMENTICIOS-COMERCIAL'},
          {id: 10, uso: 'TRANS. CARGAS GRALES', desc: 'TRANS. CARGAS GRALES-COMERCIAL'},
          {id: 11, uso: 'TRANS. COMB. GASEOSO', desc: 'TRANS. COMB. GASEOSO-COMERCIAL'},
          {id: 12, uso: 'TRANS. COMB. LIQUIDOS', desc: 'TRANS. COMB. LIQUIDOS-COMERCIAL'},
          {id: 13, uso: 'TRANS. DE HACIENDA', desc: 'TRANS. DE HACIENDA-COMERCIAL'},
          {id: 14, uso: 'TRANS. PROD. QUIMICOS', desc: 'TRANS. PROD. QUIMICOS-COMERCIAL'}
        ];

          break;
        case 26:   //M3 OMNIBUS

        this.tiposDeUso=[
          {id: 15, uso: 'ESCOLAR + 18 AS.', desc: 'ESCOLAR + 18 AS.'},
          {id: 16, uso: 'ESCOLAR 16A A 18 AS.', desc: 'ESCOLAR 16A A 18 AS.'},
          {id: 17, uso: 'FOOD TRUCK', desc: 'FOOD TRUCK'},
          {id: 18, uso: 'PARTICULAR', desc: 'PARTICULAR'},
          {id: 19, uso: 'POLICIAL', desc: 'POLICIAL'},
          {id: 20, uso: 'SERVICIO ESPECIAL', desc: 'SERVICIO ESPECIAL-COMERCIAL'},
          {id: 21, uso: 'TRASLADO DE PERSONAL PROPIO', desc: 'TRASLADO DE PERSONAL PROPIO'}
        ];
          break;
      }

      this.cdr.detectChanges(); // Fuerza la actualización del template
  }

  private getTiposVigencia(id: number): string {
    const tipoVigencia = this.tiposVigencia.find(item => item.id == id);
    return tipoVigencia ? tipoVigencia.opcion : 'ANUAL';
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
      codigoTipoInteres: [{ value: null }, Validators.required],
      tipoVehiculo: [{ value: null, disabled: true }, Validators.required],
      marca: [{ value: null, disabled: true }, Validators.required],
      anio: [{ value: null, disabled: true }, Validators.required],
      modelo: [{ value: null, disabled: true }, Validators.required],
      version: [{ value: null, disabled: true }, Validators.required],
      uso: [{ value: null, disabled: true }, Validators.required],
      codigoUso: [{ value: null, disabled: true }, Validators.required],
      tipoVigencia: [{ value: null }, Validators.required],
      cuotas: [{ value: null }, Validators.required],
      clausulaAjuste: [{ value: null }],
      condicionFiscal: [{ value: null }, Validators.required],
      cpLocalidadGuarda: [{ value: null }, Validators.required],
      controlSatelital: [{ value: null }],
      gnc: [{ value: null }],
      vigenciaDesde: [this.formatDate(new Date()), Validators.required],
      vigenciaHasta: [{ value: null }]
    });
  }

  // Función para formatear la fecha en 'yyyy-MM-dd'
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Agrega 0
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  //anios
  private loadYears(): void {
    const anioActual = new Date().getFullYear();
    this.anios = Array.from({ length: anioActual - 1989 }, (_, i) => anioActual - i);
  }


  private getMarcasInfoAuto()
  {
    this.s_infoauto.getMarcas().subscribe({
      next: (response:Brand[]) => {
        console.log(response);
        this.marcas=response;
        this.cotizacionForm.get('marca')?.enable();
      },
      error: (error) => {
        console.error('Error:', error);
      },
    });
  }

  getGruposPorMarca(brandId: number) {

    this.s_infoauto.getGruposPorMarca(brandId).subscribe({
      next: (response) => {
        console.log(response);
        this.grupos = response;
        this.cotizacionForm.get('modelo')?.enable();
      },
      error: (error:any) => {
        console.error('Error:', error);
      }
    });
  }

  getModelosPorGrupoYMarca(brand_id:number,group_id:number){

    this.s_infoauto.getModelosPorGrupoYMarca(brand_id,group_id).subscribe({
      next: (response) => {
        console.log(response);
        this.modelos = response;
        this.cotizacionForm.get('version')?.enable();
      },
      error: (error:any) => {
        console.error('Error:', error);
      }
    });
  }

  //subscripciones a form
  private setupValueChanges(): void {

    this.cotizacionForm.get('codigoTipoInteres')?.valueChanges.subscribe((tipo) => {

      if (tipo==1) {
        this.cotizacionForm.get('tipoVehiculo')?.enable();
      } else {
        this.cotizacionForm.get('tipoVehiculo')?.disable();
      }
    });

    this.cotizacionForm.get('tipoVehiculo')?.valueChanges.subscribe((tipo) => {
      this.setTiposUso(Number(tipo));
      if (tipo) {
        //this.obtenerMarcasRUS(tipo);
        this.getMarcasInfoAuto();
        this.cotizacionForm.get('uso')?.enable();
      } else {
        this.marcas = [];
        this.cotizacionForm.get('marca')?.disable();
        this.cotizacionForm.get('uso')?.disable();
      }
    });


    this.cotizacionForm.get('marca')?.valueChanges.subscribe((marca:Brand) => {
      this.cotizacionForm.get('anio')?.setValue(null);
      if (marca) {
        this.brand_idSelected=marca.id;
        this.cotizacionForm.get('anio')?.enable();
      } else {
        this.cotizacionForm.get('anio')?.disable();
      }
    });

    this.cotizacionForm.get('anio')?.valueChanges.subscribe((anio) => {
      this.cotizacionForm.get('modelo')?.setValue(null);
      if (anio) {
        //this.obtenerModelosRUS();
        this.getGruposPorMarca(this.brand_idSelected);
        //this.obtenerModelosMA();
       // this.obtenerVersionesMA();

      } else {
        this.modelos = [];
        this.cotizacionForm.get('modelo')?.disable();
      }
    });

    this.cotizacionForm.get('modelo')?.valueChanges.subscribe((modelo) => {
      this.cotizacionForm.get('version')?.setValue(null);
      if (modelo) {
        //this.obtenerVersionesRUS();
        this.group_idSelected=modelo.id;
        this.getModelosPorGrupoYMarca(this.brand_idSelected,this.group_idSelected);
       //this.obtenerVersionesMA();
      } else {
        this.versiones = [];
        this.cotizacionForm.get('version')?.disable();
      }
    });

  }


  //RIO URUGUAY


  cotizarRUS(): void {

    const formValues = this.cotizacionForm.value;
    let codigoTipo= this.getTipo(formValues.tipoVehiculo);
    const USO:TipoDeUso = formValues.uso;

    const vehiculo: VehiculosRus[]=[{
        anio: String(formValues.anio),
        controlSatelital: this.getSiNo(formValues.controlSatelital),
        cpLocalidadGuarda:Number(formValues.cpLocalidadGuarda),
        gnc: this.getSiNo(formValues.gnc),
        codia:this.getCodigoInfoAuto(),
        uso: USO.uso
    }];

    const cotizacionData: CotizacionRioUruguay = {
      codigoProductor: 4504,
      codigoSolicitante: 4504,
      codigoTipoInteres: codigoTipo,
      cuotas: Number(formValues.cuotas), //solo permite hasta 3
      ajusteAutomatico:Number(formValues.clausulaAjuste),
      condicionFiscal: this.getCondicionFiscal(formValues.condicionFiscal),
      tipoVigencia: this.getTiposVigencia(formValues.tipoVigencia),
      vehiculos: vehiculo,
      vigenciaDesde: formValues.vigenciaDesde,
      vigenciaHasta: formValues.vigenciaHasta,
      vigenciaPolizaId: 65 //autos
    };

    if(codigoTipo!='VEHICULO')
    {
      cotizacionData.vigenciaPolizaId=70; //id para motos
    }

    this.s_rus.cotizar(cotizacionData).subscribe({
      next: (response) => {
        console.log('✅ Cotización exitosa en RUS:', response);
        this.cotizacion = true;
        this.cotizacionError='';
        this.cotizacionesRus = response.dtoList;


    //console.log('Cotizaciones procesadas:', this.cotizacionesRus);
      },
      error: (error) => {
        this.cotizacion = false;

        console.error("❌ Error en cotizacion RUS:",
        error?.error?.error || "Error desconocido");

      }
    });
  }

  getCodigoInfoAuto():number{
    return Number(this.cotizacionForm.value.version.codia);
  }

  //MERCANTIL ANDINA


  cotizarMercantil()
  {
    const formValues = this.cotizacionForm.value;

    const TIPO_VEHICULO = this.getTipo(formValues.tipoVehiculo);
    const ANIO = Number(formValues.anio);
    const USO: TipoDeUso =  formValues.uso;
    const CUOTAS = Number(formValues.cuotas);
    const GNC = this.getSiNo(formValues.gnc);
    const PRODUCTOR:Productor={ id: 86322 };
    const LOCALIDAD:CotizacionLocalidad=
    { codigo_postal: Number(formValues.cpLocalidadGuarda)
      ,id:10407
    };


    if(GNC=='SI')
    {
      this.gnc=true;
    }else
    {
      this.gnc=false;
    }



    let cotizacionData: CotizacionMercantil = {
      canal: 78,
      localidad: LOCALIDAD,
      vehiculo:null,
      productor: PRODUCTOR,
      cuotas:CUOTAS,
      tipo: TIPO_VEHICULO,//este lo agregue yo para validar en el backend el endpoint
   //   comision: nose,
   //   bonificacion: nose,
   //    ajuste_suma?:number;  //10,25,50 clausula ajuste?
      desglose:true     //desglose de montos totales y cuotas
    };

    if(cotizacionData.tipo=="MOTOVEHICULO"){

      const MOTOVEHICULO:CotizacionVehiculoMoto=  {
        infoauto: this.getCodigoInfoAuto(),
        aniofab: ANIO,
        uso: USO.id,
        gnc: this.gnc,
        rastreo: 0 };
       cotizacionData.vehiculo=MOTOVEHICULO;
       cotizacionData.canal=81;

    }else
    {
      const VEHICULO:CotizacionVehiculo=  {
        infoauto: this.getCodigoInfoAuto(),
        anio: ANIO,
        uso: USO.id,
        gnc: this.gnc,
        rastreo: 0 };
        cotizacionData.vehiculo=VEHICULO;
    }

    this.s_ma.cotizar(cotizacionData).subscribe({  next: (response) => {

      console.log('✅ Cotización exitosa Mercantil Andina:', response);
      this.cotizacion = true;
      /*--TABLA*

      this.cotizacionError='';
      this.cotizacionesRus = response.dtoList;
    console.log('Cotizaciones procesadas:', this.cotizacionesRus);*/
    },
    error: (error) => {
      this.cotizacion = false;

      console.error("❌ Mercantil Andina Cotizacion Error:",
      error?.error?.error || "Error desconocido");

    }
  });

  }

  cotizarRivadavia()
  {



  }

  cotizar()
  {
    this.cotizarRivadavia();
    //this.cotizarRUS();

    //this.cotizarMercantil();
  }



}
