import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule, formatDate } from '@angular/common';
import { RioUruguayService } from '../../services/rio-uruguay.service';
import { CotizacionRioUruguay, RusCotizado, TipoVehiculoRUS, VehiculosRus } from '../../interfaces/cotizacionRioUruguay';
import { CotizacionLocalidad, CotizacionMercantil,CotizacionVehiculo,CotizacionVehiculoMoto,MercantilCotizado,Productor } from '../../interfaces/cotizacionMercantil';
import { MercantilAndinaService } from '../../services/mercantil-andina.service';
import { TipoDeUso } from '../../interfaces/tiposDeUso';
import { ChangeDetectorRef } from '@angular/core';
import { InfoautoService } from '../../services/infoauto.service';
import { Brand, Group, Model } from '../../classes/infoauto';
import { RivadaviaService } from '../../services/rivadavia.service';
import { CondicionIB, DatosCotizacionRivadavia, EstadoGNC, TipoDocumento, TipoFacturacion } from '../../interfaces/cotizacionRivadavia';
import { FederacionService } from '../../services/federacion.service';
import { CotizacionFederacion, LocalidadesFederacion } from '../../interfaces/cotizacionfederacion';
import { AtmService } from '../../services/atm.service';
import { CondicionFiscal } from '../../interfaces/condicionFiscal';
import { CotizacionFormValue } from '../../interfaces/cotizacionFormValue';
import { CondicionFiscalCodigo } from '../../enums/condicion';
import { Tipo, TipoId, TipoPersoneria, TipoRefacturacion } from '../../interfaces/tipos';
import { Cobertura } from '../../interfaces/cobertura';
import { EProvincia, Provincia } from '../../interfaces/provincia';
@Component({
  selector: 'app-multicotizador',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './multicotizador.component.html',
  styleUrl: './multicotizador.component.css'
})
export class MulticotizadorComponent implements OnInit {

  //FOrm
  cotizacionForm!: FormGroup;
  form!: CotizacionFormValue;
  federacionForm:boolean=false;
  marcas: Brand[] = [];
  brand_idSelected:number=0;
  group_idSelected:number=0;
  anios: number[] = [];
  //fed
  tiposPersoneria: TipoPersoneria[]=[];
  tipoPersona!: TipoPersoneria;
  tipoVehiculo:string="";
  tiposId:TipoId[]=[];
  tiposDeRastreadores:Tipo[]=[];
  tiposDeRefacturacion:TipoRefacturacion[]=[];
  descuentoComision:Tipo[]=[];
  mediosPago:Tipo[]=[];
  coberturas:Cobertura[]=[];
  franquicias:Tipo[]=[];

  //riv
  provincias:Provincia[]=[];
  codigoTipoInteres:string='';
  codModelo:number=0;
  gnc:boolean=false;
  grupos: Group[] = [];
  modelos: Model[] = [];
  versiones: any[] = [];
  usos: any[] = [];
  codigosUso: any[] = [];
  anio:number=0;
  codigoInfoAuto:number=0;
  codigoRivadavia:String="";
  sumaRivadavia:String="";

  codigoPostalFederacion:String="";
  tipoVehiculoFederacion:number=0;

  cotizacionesRus: RusCotizado[] = [];
  cotizacion:boolean=true;
  cotizacionError:string='';
  tiposDeUso: TipoDeUso[]= [];

  constructor(
    @Inject(RioUruguayService) private s_rus: RioUruguayService,
    @Inject(MercantilAndinaService) private s_ma: MercantilAndinaService,
    @Inject(InfoautoService) private s_infoauto: InfoautoService,
    @Inject(RivadaviaService) private s_riv: RivadaviaService,
    @Inject(FederacionService) private s_fedPat: FederacionService,
    @Inject(AtmService) private s_ATM: AtmService,
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
    { id: 2, nombre: 'MOTOVEHICULO'},
    { id: 3, nombre: 'PERSONA' },
    { id: 4, nombre: 'VIVIENDA' },
    { id: 5, nombre: 'COMERCIO' },
    { id: 6, nombre: 'BICICLETA' },
    { id: 7, nombre: 'MAQUINARIA' },
    { id: 8, nombre: 'ACOPLADOS' },
    { id: 9, nombre: 'TRAILERS'},
    { id: 10, nombre: 'IMPLEMENTOS'},
    { id: 11, nombre: 'CONSORCIO'},
    { id: 12, nombre: 'Otro riesgo'},
  ];

  public readonly cuotas=[1,2,3,4,5,6];

  public readonly clausulasAjuste:Tipo[]=
  [
    { codigo: 0, descripcion: '0%' },
    { codigo: 10, descripcion: '10%' },
    { codigo: 20, descripcion: '20%' },
    { codigo: 30, descripcion: '30%'}
  ];

  public readonly opcionesSiNo = [
    { id: 1, opcion: 'SI' },
    { id: 2, opcion: 'NO' }
  ];

  public readonly tiposVigencia = [
    { id: 1, opcion: 'TRIMESTRAL  (valido solo Rio Uruguay)' },
    { id: 2, opcion: 'SEMESTRAL - (valido solo Rio Uruguay)' },
    { id: 3, opcion: 'ANUAL' }
  ];

  public readonly condicionesFiscales: CondicionFiscal[] = [
    { id: 1, cfFedRusATM: CondicionFiscalCodigo.CF, descripcion: 'Consumidor final', cfMercantil: 5, cfRivadavia:'CONSUMIDOR_FINAL'},
    { id: 2, cfFedRusATM: CondicionFiscalCodigo.EX, descripcion: 'Exento', cfRivadavia:'EXCENTO'},
    { id: 3, cfFedRusATM: CondicionFiscalCodigo.FM, descripcion: 'Resp. Inscp. Fac. M', cfRivadavia:'RESPONSABLE_INSCRIPTO'},
    { id: 4, cfFedRusATM: CondicionFiscalCodigo.GC, descripcion: 'Gran contribuyente', cfRivadavia:'RESPONSABLE_INSCRIPTO'},
    { id: 5, cfFedRusATM: CondicionFiscalCodigo.RI, descripcion: 'Responsable inscripto', cfRivadavia:'RESPONSABLE_INSCRIPTO'},
    { id: 6, cfFedRusATM: CondicionFiscalCodigo.RMT, descripcion: 'Responsable monotributo', cfRivadavia:'MONOTRIBUTISTA'},
    { id: 7, cfFedRusATM: CondicionFiscalCodigo.RNI, descripcion: 'No inscripto', cfRivadavia:'NO_CATEGORIZADO'},
    { id: 8, cfFedRusATM: CondicionFiscalCodigo.SSF, descripcion: 'Sin situación fiscal', cfRivadavia:'NO_CATEGORIZADO'},
    { id: 9, cfFedRusATM: CondicionFiscalCodigo.CDE, descripcion: 'Cliente del exterior', cfRivadavia:'CONSUMIDOR_FINAL'}
  ];


  public tiposVehiculo:TipoVehiculoRUS[] = [];



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

  private getSiNo(value: boolean): string {
    return value === true ? 'SI' : 'NO';
  }


  private initForm(): void {
    this.cotizacionForm = this.fb.group({
      alarma: [true],
      anio: [{ value: null, disabled: true }, Validators.required],
      apellido: [""],
      cascoConosur:false,
      clausulaAjuste: [{ value: null }],
      codigoTipoInteres: [{ value: null }, Validators.required],
      condicionFiscal: [{id: 0, descripcion: ''}, Validators.required],
      controlSatelital: false,
      cpLocalidadGuarda: [{ value: null }, Validators.required],
      cuotas: [{ value: null }, Validators.required],
      descuentoComision:0,
      franquicia:[],
      gnc: false,
      grua:false,
      marca: [{ value: null, disabled: true }, Validators.required],
      medioPago:false,
      modelo: [{ value: null, disabled: true }, Validators.required],
      nombre: [""],
      nroId: [""],
      pagoContado:false,
      provincia: null,
      rastreador: false,
      tallerExclusivo:false,
      tieneRastreador:false,
      tipoId: [{ value: null }],
      tipoPersoneria: [{ value: "" }],
      tipoRefacturacion:[],
      tipoVigencia: [{ value: null }, Validators.required],
      tipoVehiculo: [{ value: null, disabled: true }, Validators.required],
      uso: [{ value: null, disabled: true }, Validators.required],
      version: [{ value: null, disabled: true }, Validators.required],
      vigenciaDesde: [this.formatDateSinceYear(new Date()), Validators.required],
      vigenciaHasta: [{ value: null }],
    });

    this.tiposId=[
      {tipo_id: 'DNI'},
      {tipo_id: 'PA (pasaporte)'},
      {tipo_id: 'Libreta Civica'},
      {tipo_id: 'Libreta de enrolamiento'},
    ];

    this.tiposDeRefacturacion=[
    {codigo:2,descripcion:'SEMESTRAL', mercantilPeriodo:0}, //atm no MA tamp
    {codigo:12,descripcion:'MENSUAL', mercantilPeriodo:1}, //todas
    {codigo:0,descripcion:'CUATRIMESTRAL', mercantilPeriodo:4}, //SOLO RIV Y MA
    {codigo:0,descripcion:'TRIMESTRAL', mercantilPeriodo:0},  // ni MA ni fed
    {codigo:0,descripcion:'BIMESTRAL', mercantilPeriodo:0}, //SOLO ATM
    ];


      //ver con el planchon
    this.descuentoComision =[
        {codigo:1,descripcion:'1%'},
        {codigo:2,descripcion:'2%'},
        {codigo:3,descripcion:'3%'},
        {codigo:4,descripcion:'4%'},
        {codigo:5,descripcion:'5%'},
        ];

    this.mediosPago=[
      {codigo:1,descripcion:'Efectivo'},
      {codigo:2,descripcion:'Debito/Credito'},
    ];

    this.provincias=[
      {id:1,descripcion:'Buenos Aires', provinciaRiv:EProvincia.BUENOS_AIRES},
      {id:2,descripcion:'Capital Federal', provinciaRiv:EProvincia.CAPITAL_FEDERAL},
      {id:3,descripcion:'Catamarca', provinciaRiv:EProvincia.CATAMARCA},
      {id:4,descripcion:'Chaco', provinciaRiv:EProvincia.CHACO},
      {id:5,descripcion:'Chubut', provinciaRiv:EProvincia.CHUBUT},
      {id:6,descripcion:'Cordoba', provinciaRiv:EProvincia.CORDOBA},
      {id:7,descripcion:'Corrientes', provinciaRiv:EProvincia.CORRIENTES},
      {id:8,descripcion:'Entre Rios', provinciaRiv:EProvincia.ENTRE_RIOS},
      {id:9,descripcion:'Formosa', provinciaRiv:EProvincia.FORMOSA},
      {id:10,descripcion:'Jujuy', provinciaRiv:EProvincia.JUJUY},
      {id:11,descripcion:'La Pampa', provinciaRiv:EProvincia.LA_PAMPA},
      {id:12,descripcion:'La Rioja', provinciaRiv:EProvincia.LA_RIOJA},
      {id:13,descripcion:'Mendoza', provinciaRiv:EProvincia.MENDOZA},
      {id:14,descripcion:'Misiones', provinciaRiv:EProvincia.MISIONES},
      {id:15,descripcion:'Neuquen', provinciaRiv:EProvincia.NEUQUEN},
      {id:16,descripcion:'Rio Negro', provinciaRiv:EProvincia.RIO_NEGRO},
      {id:17,descripcion:'Salta', provinciaRiv:EProvincia.SALTA},
      {id:18,descripcion:'San Juan', provinciaRiv:EProvincia.SAN_JUAN},
      {id:19,descripcion:'San Luis', provinciaRiv:EProvincia.SAN_LUIS},
      {id:20,descripcion:'Santa Cruz', provinciaRiv:EProvincia.SANTA_CRUZ},
      {id:21,descripcion:'Santa Fe', provinciaRiv:EProvincia.SANTA_FE},
      {id:22,descripcion:'Santiago Del Estero', provinciaRiv:EProvincia.SANTIAGO_DEL_ESTERO},
      {id:23,descripcion:'Tierra Del Fuego', provinciaRiv:EProvincia.TIERRA_DEL_FUEGO},
      {id:24,descripcion:'Tucuman', provinciaRiv:EProvincia.TUCUMAN},
    ];
    this.coberturas=[
      {codigo:1,descripcion:'Todas las coberturas',valor:'N'},
      {codigo:2,descripcion:'A-RESP. CIVIL Obligatoria',valor:'A'},
      {codigo:3,descripcion:'A4-RESP.CIVIL LIMITE MAXIMO UNICA',valor:'A4'},
      {codigo:4,descripcion:'B-RC.PERD TOTAL Accid. Inc. y Robo',valor:'B'},
      {codigo:5,descripcion:'B1-RC.PERD TOTAL Inc. y Robo',valor:'B1'},
      {codigo:6,descripcion:'C-RC.P.T Accid. y P.TyP Inc. y Robo',valor:'C'},
      {codigo:7,descripcion:'C1-RC. P.TOTAL y PARCIAL Inc. y Robo',valor:'C1'},
      {codigo:8,descripcion:'CF-RC.PT Ac. y P.TyP Inc. y Robo FULL',valor:'CF'},
      {codigo:9,descripcion:'E-CUARENTENA',valor:'E'},
      {codigo:10,descripcion:'E1-INCENDIO Y ROBO TOTAL EN GARAGE',valor:'E1'},
      {codigo:11,descripcion:'LB-RC.P.T Acc, P.TyP Inc. yR.,RP TOT.',valor:'LB'},
      {codigo:12,descripcion:'LB1-RC P.TyP Inc. y R.,RP Amp TOT.',valor:'LB1'},
      {codigo:13,descripcion:'TD-TODO RIESGO CON FRANQUICIA',valor:'TD'},
      {codigo:14,descripcion:'TD1-TODO RIESGO SIN FRANQUICIA',valor:'TD1'},
      {codigo:15,descripcion:'TD3-TODO RIESGO CON FRANQUICIA FIJA.',valor:'TD3'},
    ];

    this.s_fedPat.getTiposPersoneria().subscribe({

      next: (tipos) => {
        console.log(tipos);
      // Ordenar: primero el que tenga descripcion "Persona Fisica"
      this.tiposPersoneria = tipos.sort((a, b) => {
      if (a.descripcion === 'Persona Fisica') return -1;
      if (b.descripcion === 'Persona Fisica') return 1;
      return 0;
    });
        this.tiposPersoneria = tipos;
      },
      error: (err) => {
        console.error("Error cargando tipos de personería", err);
      }
    });


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
      let auxTiposVehiculos: TipoVehiculoRUS[]=[];
      if (tipo.nombre=="VEHICULO") {

        auxTiposVehiculos=[{ id: 1, nombre: 'AUTO' },
        { id: 2, nombre: 'PICK-UP "A"' },
        { id: 3, nombre: 'PICK-UP "B"' },
        { id: 4, nombre: 'CAMION HASTA 5 TN' },
        { id: 5, nombre: 'CAMION HASTA 10 TN' },
        { id: 6, nombre: 'CAMION MAS 10 TN' },
        { id: 25, nombre: 'MOTORHOME' },
        { id: 26, nombre: 'M3 OMNIBUS' }];

      }else if (tipo.nombre=="MOTOVEHICULO"){
        auxTiposVehiculos=[{ id: 7, nombre: 'MOTO MENOS 50 CC' },
          { id: 8, nombre: 'MOTO MAS 50 CC' }];

      } else {
        this.cotizacionForm.get('tipoVehiculo')?.disable();
      }
      this.tiposVehiculo=auxTiposVehiculos;
      this.cotizacionForm.get('tipoVehiculo')?.enable();
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

    this.cotizacionForm.get('tipoPersoneria')?.valueChanges.subscribe((tipoPersona) => {

      if (tipoPersona) {
        this.tipoPersona=tipoPersona;
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
        this.anio=anio;
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

    //Para traer codigo de Rivadavia y franquicia federacion.
    this.cotizacionForm.get('version')?.valueChanges.subscribe((version) => {
      if (version) {
      console.log(version);
      this.codigoInfoAuto=version.codia;
      const nroProductorRiv= String(18922);
      const anio= String(this.anio);

      this.s_fedPat.getFranquicia(String(this.codigoInfoAuto),this.formatDateSinceDay(new Date())).subscribe({
        next: (res) => {
          this.franquicias=res;
        },
        error: (err) => {
          console.log(err);
        }
      });

      this.s_riv.getSumaAsegurada(nroProductorRiv,this.codigoInfoAuto,anio).subscribe({
        next: (res) => {
         const tipoVehiculo= res.tipoVehiculo;
         this.sumaRivadavia= res.suma;
         const tipoUso= "1";
          //llamarlo todo cuando se elija el tipo de uso mejor?
         this.s_riv.getCodigoVehiculo(nroProductorRiv,tipoVehiculo,tipoUso).subscribe({
          next: (res) => {
            this.codigoRivadavia= res.tarifasDto[0].codigoVehiculo;
          },
          error: (err) => {
            console.log(err);
          }
        });
        },
        error: (err) => {
          console.log(err);
        }
      });
      }
    });

    this.cotizacionForm.get('cpLocalidadGuarda')?.valueChanges.subscribe((zipCode) => {
      if (zipCode) {

        const zipCodeString=String(zipCode);

        if(zipCodeString.length>=4)
        {

          this.s_fedPat.getLocalidades().subscribe( { next:(resp) => {

          const array: LocalidadesFederacion[] = resp.respuesta;

          const localidadEncontrada = array.find(loc => loc.codigoPostal === zipCode);

          if (localidadEncontrada) {
            this.codigoPostalFederacion=localidadEncontrada.codigo;
          } else {
            console.log('❌ No se encontró localidad con ese código postal');
          }

          },
          error: (error) => {
            console.error("❌ ERROR:",
            error?.error?.error || "Error desconocido");
          }  });
        }
      }
    });



    this.cotizacionForm.get('uso')?.valueChanges.subscribe((uso) => {
      if (uso) {
        console.log(uso);
        //tipos de federacion
        this.s_fedPat.getTiposVehiculo(this.codigoInfoAuto).subscribe({
          next: (res:any[]) => {

          const tipoMatch = res.find(t =>
          uso.uso === 'PARTICULAR' ? t.descripcion.toUpperCase().includes('PARTICULAR') :
          uso.uso === 'COMERCIAL'  ? t.descripcion.toUpperCase().includes('COMERCIAL') :
          false
        );
          if (tipoMatch) {
            this.tipoVehiculoFederacion = tipoMatch.codigo;
          } else {
            console.warn("⚠️ No se encontró tipo de vehículo que coincida con el uso");
          }

        },
        error: (err) => {
            console.log(err);
            //this.federacionForm=false;
          }
        });

        this.federacionForm=true;
      }

    });

    this.cotizacionForm.get('tieneRastreador')?.valueChanges.subscribe((rastreador) => {

      if (rastreador) {
        this.s_fedPat.getRastreadores().subscribe((rastreadores) => {
          if (rastreadores) {
            this.tiposDeRastreadores=rastreadores;
          }
        });
      } else {

      }
    });

  }

  //RIO URUGUAY
  cotizarRUS(): void {


    let codigoTipo= this.getTipo(this.form.tipoVehiculo);
    const USO:TipoDeUso = this.form.uso;

    const vehiculo: VehiculosRus[]=[{
        anio: String(this.form.anio),
        controlSatelital: this.getSiNo(this.form.controlSatelital),
        cpLocalidadGuarda:Number(this.form.cpLocalidadGuarda),
        gnc: this.getSiNo(this.form.gnc),
        codia:this.getCodigoInfoAuto(),
        uso: USO.uso,
        rastreoACargoRUS: this.getSiNo(this.form.tieneRastreador),
    }];

    const cotizacionData: CotizacionRioUruguay = {
      codigoProductor: 4504,
      codigoSolicitante: 4504,
      codigoTipoInteres: codigoTipo,
      cuotas: Number(this.form.cuotas), //solo permite hasta 3
      ajusteAutomatico:Number(this.form.clausulaAjuste.codigo),
      condicionFiscal: this.form.condicionFiscal.cfFedRusATM,
      tipoVigencia: this.getTiposVigencia(this.form.tipoVigencia),
      vehiculos: vehiculo,
      vigenciaDesde: this.form.vigenciaDesde,
      vigenciaHasta: this.form.vigenciaHasta,
      vigenciaPolizaId: 65 //id de autos
    };

    if(codigoTipo=='MOTOVEHICULO')
    {
      cotizacionData.vigenciaPolizaId=70; //id para motos
    }

    this.s_rus.cotizar(cotizacionData).subscribe({
      next: (response) => {
        console.log('✅ Cotización exitosa en RUS:', response);
        this.cotizacion = true;
        this.cotizacionError='';
        this.cotizacionesRus = response.dtoList;

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
    const TIPO_VEHICULO = this.getTipo(this.form.tipoVehiculo);
    const ANIO = Number(this.form.anio);
    const USO: TipoDeUso =  this.form.uso;
    const PRODUCTOR:Productor={ id: 86322 };
    const LOCALIDAD:CotizacionLocalidad=
    { codigo_postal: Number(this.form.cpLocalidadGuarda),
      id:10407,
      provincia: this.form.provincia.descripcion
    };
    const RASTREADOR=this.form.rastreador ? 1 : 0;


    let cotizacionData: CotizacionMercantil = {
      canal: 78, //canal autos
      localidad: LOCALIDAD,
      vehiculo:null,
      productor: PRODUCTOR,
      cuotas:Number(this.form.cuotas),
      tipo: TIPO_VEHICULO,//este lo agregue yo para validar en el backend el endpoint
      periodo: Number(this.form.tipoRefacturacion?.mercantilPeriodo),
      iva: Number(this.form.condicionFiscal.cfMercantil),
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
        gnc: this.form.gnc,
        rastreo: RASTREADOR };
       cotizacionData.vehiculo=MOTOVEHICULO;
       cotizacionData.canal=81; //canal motos

    }else
    {
      const VEHICULO:CotizacionVehiculo=  {
        infoauto: this.getCodigoInfoAuto(),
        anio: ANIO,
        uso: USO.id,
        gnc: this.form.gnc,
        rastreo: RASTREADOR };
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


  // Función para formatear la fecha en 'yyyy-MM-dd'
  private formatDateSinceYear(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Agrega 0
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
 // Función para formatear la fecha en 'dd-MM-yyyy'
  private formatDateSinceDay(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Agrega 0
    const day = date.getDate().toString().padStart(2, '0');
    return `${day}-${month}-${year}`;
  }

  //Rivadavia
  cotizarRivadavia()
  {
    //formatDateSinceYear
    const gnc= this.form.gnc ? EstadoGNC.POSEE_GNC_ASEGURA : EstadoGNC.NO_POSEE_GNC;
    const personaJuridica =
    this.form.tipoPersoneria.descripcion === 'Persona Fisica' ? false: true;

    const formaPago= this.form.medioPago
    const cotizacion: DatosCotizacionRivadavia = {
      nroProductor: "18922",
      claveProductor: "THLV2582",
      datoAsegurado: {
        tipoDocumento: this.form.tipoId,
        condicionIVA: this.form.condicionFiscal.cfRivadavia,
        condicionIB: CondicionIB.CONSUMIDOR_FINAL, //lo agrego?
        nroDocumento: this.form.nroId,
        //cuil: "",
        //cuit: "asd",
        //fechaNacimiento?: string;
        personaJuridica:personaJuridica,
        //  formaPago?: FormaPago;  AGREGAR
      },
      datoVehiculo: {
        codigoInfoAuto: String(this.codigoInfoAuto),
        codigoVehiculo: String(this.codigoRivadavia),
        modeloAnio: String(this.anio),
        sumaAsegurada: Number(this.sumaRivadavia),
        porcentajeAjuste: Number(this.form.clausulaAjuste.codigo),
      },
      datoPoliza: {
        nroPoliza: "12322",
        fechaVigenciaDesde: this.form.vigenciaDesde,
        fechaVigenciaHasta: this.form.vigenciaHasta,
        cantidadCuotas: String(this.form.cuotas),
        tipoFacturacion: TipoFacturacion.MENSUAL, //tiene mas que fedpat.
        provincia: this.form.provincia.provinciaRiv,
        codigoPostal: this.form.cpLocalidadGuarda,
        sumaAseguradaAccesorios: 0, //y
        sumaAseguradaEquipaje: 0,    //estos?
        gnc: gnc,
          //cantidadAsientos?: string;
          //alarmaSatelital?: AlarmaSatelital;
          //subrogado?: boolean;
          //coeficienteRC?: number;    ESTOS SON DECUENTOS agregarlo con POLIZAS VINCULADAS
          //coeficienteCasco?: number;  ESTOS SON DESCUENTOS agregarlo con POLIZAS VINCULADAS
          //porcentajeBonificacion?: number;   DESCUENTOS PERO DESCONTANDO COMISION
          //aniosSinSiniestros?: AniosSinSiniestros;
      },
      polizasVinculadas: {
        accidentePasajeros: "n",
        accidentePersonales: "n",
        combinadoFamiliar: "n",
        incendio: "n",
        vidaIndividual: "n"
      }
    };

    console.log(cotizacion);

    this.s_riv.cotizarRivadavia(cotizacion).subscribe({
      next: (res) => {
       console.log('✅ Cotización exitosa Rvadavia:',res);
      },
      error: (err) => {
        console.log(err);
      }
    });


  }

  //Federacion patronal
  cotizarFederacion()
  {
    let rastreador= this.form.rastreador? Number(this.form.rastreador.codigo): 99;

    let comision= this.form.descuentoComision? Number(this.form.descuentoComision.codigo):0;

    const fechaOriginal = this.form.vigenciaDesde;
    const fechaFormateada = formatDate(fechaOriginal, 'dd/MM/yyyy', 'en-AR');

    const cotizacionFederacion: CotizacionFederacion = {
      //numero_cotizacion: 129445013,
      fecha_desde: fechaFormateada,
      descuento_comision: comision,
      medio_pago: Number(this.form.medioPago.codigo),
      pago_contado: Boolean(this.form.pagoContado),
      razon_social: Number(this.form.tipoPersoneria.codigo),
      //cliente_nuevo: false,
      refacturaciones: Number(this.form.tipoRefacturacion?.codigo),
      contratante: {
        id: Number(this.form.nroId),
        tipo_id: this.form.tipoId,
       // cuit: '20352928587',
        nombre: this.form.nombre,
        apellido: this.form.apellido,
        condicion_iva: this.form.condicionFiscal.cfFedRusATM,
        //localidad: 0,
        //matricula: '1125554'
      },
      vehiculo: {
        infoauto: String(this.codigoInfoAuto),
        anio: String(this.anio),
        tipo_vehiculo: this.tipoVehiculoFederacion,
        alarma: Boolean(this.form.alarma),
        rastreador:rastreador,
        gnc: Boolean(this.form.gnc),
        //volcador: false,
        //suma_asegurada: 1200000,
        localidad_de_guarda: Number(this.codigoPostalFederacion)
      },
      coberturas: {
        ajuste_automatico: 99, //en mensuales hasta 10,
        rc_ampliada: 99, //diferencia entre ajuste automatico y esto
        interasegurado: true, //siempre true
        rc_conosur:1,
        grua:Boolean(this.form.grua),
        taller_exclusivo:Boolean(this.form.tallerExclusivo),
        casco_conosur:true,
        plan: "null",
        franquicia: Number(this.form.franquicia.codigo),
      },/*
      producto_modular: {
        cant_modulos: 0,
        codigo_producto: '190001',
        fecha_nacimiento: '13/07/1998'
      },*/
    };


    console.log(cotizacionFederacion);


    this.s_fedPat.cotizarFederacion(cotizacionFederacion).subscribe({
      next: (res) => {
       console.log('✅ Cotización exitosa Federacion:',res);
      },
      error: (err) => {
        console.log(err);
      }
    });

  }

  cotizarATM(){
    const fechaOriginal = this.form.vigenciaDesde;
    const [anio, mes, dia] = fechaOriginal.split("-");
    const fechaFormatoATM = `${dia}${mes}${anio}`;
    const alarma= this.form.alarma ? 1: 0;

    const persona =
    this.form.tipoPersoneria.descripcion === 'Persona Fisica' ? 'F' : 'J';

    const xml = `
    <soapenv:Envelope xmlns:tem="http://tempuri.org/" xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
        <soapenv:Body>
           <tem:AUTOS_Cotizar>
              <tem:doc_in>
     <auto>
       <usuario>
         <usa>TECYSEG</usa>
         <pass>TECYSEG%24</pass>
         <fecha>${fechaFormatoATM}</fecha>
         <vendedor>0956109561</vendedor>
         <origen>WS</origen>
         <plan>02</plan>
       </usuario>
       <asegurado>
         <persona>${persona}</persona>
         <iva>${this.form.condicionFiscal.cfFedRusATM}</iva>
         <cupondscto></cupondscto>
         <bonificacion></bonificacion>
       </asegurado>
       <bien>
         <cerokm>N</cerokm>
         <rastreo>N</rastreo>
         <micrograbado>N</micrograbado>
         <alarma>${alarma}</alarma>
         <ajuste></ajuste>
         <codpostal>${this.form.cpLocalidadGuarda}</codpostal>
         <cod_infoauto>${this.codigoInfoAuto}</cod_infoauto>
         <anofab>${this.anio}</anofab>
         <seccion>3</seccion>
         <uso>0101</uso>
         <suma></suma>
       </bien>
     </auto>
              </tem:doc_in>
           </tem:AUTOS_Cotizar>
        </soapenv:Body>
     </soapenv:Envelope>`.trim();


     console.log("Enviando a ATM",xml);
     this.s_ATM.cotizarATM(xml).subscribe({
       next: (res) => {
        console.log('✅ Cotización exitosa ATM:',res);
       },
       error: (err) => {
         console.log(err);
       }
     });
  }


  cotizar()
  {
    this.form = this.cotizacionForm.getRawValue();
    this.cotizarRivadavia();

    this.cotizarFederacion();
    // this.cotizarRUS();

    this.cotizarATM();

    this.cotizarMercantil();
  }



}
