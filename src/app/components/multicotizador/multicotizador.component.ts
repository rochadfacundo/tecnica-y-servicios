import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RioUruguayService } from '../../services/rio-uruguay.service';
import { RusCotizado, TipoVehiculoRUS } from '../../interfaces/cotizacionRioUruguay';
import { MercantilAndinaService } from '../../services/mercantil-andina.service';
import { TipoDeUso } from '../../enums/tiposDeUso';
import { ChangeDetectorRef } from '@angular/core';
import { InfoautoService } from '../../services/infoauto.service';
import { Brand, Group, Model } from '../../classes/infoauto';
import { RivadaviaService } from '../../services/rivadavia.service';
import {  DatosCotizacionRivadavia, EstadoGNC, FormaPago, TipoDocumento, TipoFacturacion } from '../../interfaces/cotizacionRivadavia';
import { FederacionService } from '../../services/federacion.service';
import {LocalidadesFederacion } from '../../interfaces/cotizacionfederacion';
import { AtmService } from '../../services/atm.service';
import { CondicionFiscal } from '../../interfaces/condicionFiscal';
import { CotizacionFormValue } from '../../interfaces/cotizacionFormValue';
import { CondicionFiscalCodigo } from '../../enums/condicion';
import { Tipo, TipoId, TipoPersoneria, TipoRefacturacion } from '../../interfaces/tipos';
import { Cobertura } from '../../interfaces/cobertura';
import { EProvincia, Provincia } from '../../interfaces/provincia';
import { NgSelectModule } from '@ng-select/ng-select';
import { downloadJSON, formatDateSinceDay, formatDateSinceYear, getTipo, getYesNo, loadYears } from './utils/utils';
import { buildATMRequest, construirCotizacionATM, parsearXML } from './cotizadores/atm';
import { buildRusRequest, construirCotizacionRus, getTiposVehiculoRUS } from './cotizadores/rioUruguay';
import { Cotizacion } from '../../interfaces/cotizacion';
import { buildFederacionRequest, construirCotizacionFederacion } from './cotizadores/federacionPatronal';
import { buildMercantilRequest, construirCotizacionMercantil } from './cotizadores/mercantilAndina';
import { buildRivadaviaRequest, construirCotizacionRivadavia } from './cotizadores/rivadavia';
import { TipoVehiculo } from '../../enums/tipoVehiculos';

@Component({
  selector: 'app-multicotizador',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule,NgSelectModule],
  templateUrl: './multicotizador.component.html',
  styleUrl: './multicotizador.component.css'
})
export class MulticotizadorComponent implements OnInit {
  @Output() cotizacionGenerada = new EventEmitter<Cotizacion>();

  cotizacionForm!: FormGroup;
  form!: CotizacionFormValue;
  federacionForm:boolean=false;
  marcas: Brand[] = [];
  brand_idSelected:number=0;
  group_idSelected:number=0;
  anios: number[] = [];
  //fed
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
  tipoInteres:string='';
  codModelo:number=0;
  tieneGnc:boolean=false;
  gnc:number=0;
  grupos: Group[] = [];
  modelos: Model[] = [];
  versiones: any[] = [];
  usos: any[] = [];
  codigosUso: any[] = [];
  anio:number=0;
  codigoInfoAuto:number=0;
  codigoRivadavia:string="";
  sumaRivadavia:string="";

  codigoPostalFederacion:string="";
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
    this.anios= loadYears();
    this.setupValueChanges();

  }

  public readonly tipoInteresOpciones:Tipo[]=
  [
    { codigo: 1, descripcion: TipoVehiculo.VEHICULO },
    { codigo: 2, descripcion: TipoVehiculo.MOTOVEHICULO},
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
    { id: 1,descripcion:'TRIMESTRAL  (valido solo Rio Uruguay)' , opcion: 'TRIMESTRAL' },
    { id: 2, descripcion:'SEMESTRAL  (valido solo Rio Uruguay)', opcion: 'SEMESTRAL' },
    { id: 3, descripcion:'ANUAL',opcion: 'ANUAL' }
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

  private initForm(): void {
    this.cotizacionForm = this.fb.group({
      alarma: [true],
      anio: [{ value: null, disabled: true }, Validators.required],
      apellido: [""],
      cascoConosur:false,
      clausulaAjuste: [{ value: { codigo: 10, descripcion: '10%' }, disabled: true }],
      tipoInteres: [{ value: null }, Validators.required],
      condicionFiscal: [{id: 0, descripcion: ''}, Validators.required],
      controlSatelital: false,
      cpLocalidadGuarda: [{ value: null }, Validators.required],
      cuotas: [{ value: null }, Validators.required],
      descuentoComision:0,
      franquicia:[],
      tieneGnc:false,
      gnc: 0,
      grua:false,
      marca: [{ value: null, disabled: true }, Validators.required],
      medioPago:false,
      modelo: [{ value: null, disabled: true }, Validators.required],
      nombre: [""],
      nroId: [""],
      provincia: null,
      rastreador: false,
      tallerExclusivo:false,
      tieneRastreador:false,
      tipoId: "DNI",
      tipoRefacturacion:[],
      tipoVigencia: [{ value: null }, Validators.required],
      tipoVehiculo: [{ value: null, disabled: true }, Validators.required],
      version: [{ value: null, disabled: true }, Validators.required],
      vigenciaDesde: [formatDateSinceYear(new Date()), Validators.required],
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


  }

      //COmparar clausulas para dar una por defecto.
     compararClausula(op1: Tipo, op2: Tipo): boolean {
        return op1?.codigo === op2?.codigo;
      }




  private getMarcasInfoAuto()
  {
    this.s_infoauto.getMarcas(this.getTipoVehiculo()).subscribe({
      next: (response:Brand[]) => {
        console.log(response);
        this.marcas=response;

      },
      error: (error) => {
        console.error('Error:', error);
      },
    });
  }

  getGruposPorMarca(brandId: number) {

    this.s_infoauto.getGruposPorMarca(brandId,this.getTipoVehiculo()).subscribe({
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

    this.s_infoauto.getModelosPorGrupoYMarca(brand_id,group_id,this.getTipoVehiculo()).subscribe({
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

    this.cotizacionForm.get('tipoInteres')?.valueChanges.subscribe((tipo) => {

      if (tipo) {
        this.tiposVehiculo = getTiposVehiculoRUS(tipo.descripcion);

        this.cotizacionForm.get('tipoVehiculo')?.enable();
      } else {
        this.cotizacionForm.get('tipoVehiculo')?.disable();
      }

      this.cdr.detectChanges(); // ✅ está bien que lo fuerces si usás *ngIf

    });

    this.cotizacionForm.get('tipoVehiculo')?.valueChanges.subscribe((tipo) => {

      this.cdr.detectChanges(); // Fuerza la actualización del template
      if (tipo) {

        this.getMarcasInfoAuto();
        this.cotizacionForm.get('uso')?.enable();
        this.cotizacionForm.get('marca')?.enable();
      } else {
        this.marcas = [];
        this.cotizacionForm.get('marca')?.disable();
        this.cotizacionForm.get('uso')?.disable();
      }
    });

    this.cotizacionForm.get('marca')?.valueChanges.subscribe((idMarca:number) => {
      this.cotizacionForm.get('anio')?.setValue(null);
      if (idMarca) {
        console.log(idMarca);
        this.brand_idSelected=idMarca;
        this.cotizacionForm.get('anio')?.enable();
      } else {
        this.cotizacionForm.get('anio')?.disable();
      }
    });

    this.cotizacionForm.get('anio')?.valueChanges.subscribe((anio) => {
      this.cotizacionForm.get('modelo')?.setValue(null);
      if (anio && this.brand_idSelected) {
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

    this.cotizacionForm.get('modelo')?.valueChanges.subscribe((idModelo:number) => {
      this.cotizacionForm.get('version')?.setValue(null);
      if (idModelo) {
        //this.obtenerVersionesRUS();
        this.group_idSelected=idModelo;
        this.getModelosPorGrupoYMarca(this.brand_idSelected,this.group_idSelected);
       //this.obtenerVersionesMA();
      } else {
        this.versiones = [];
        this.cotizacionForm.get('version')?.disable();
      }
    });

    //Para traer codigo de Rivadavia y franquicia federacion.
    this.cotizacionForm.get('version')?.valueChanges.subscribe((codia:number) => {
      if (codia) {
      console.log(codia);
      this.codigoInfoAuto=codia;
      const nroProductorRiv= String(18922);
      const anio= String(this.anio);

      this.s_fedPat.getFranquicia(String(this.codigoInfoAuto),formatDateSinceDay(new Date())).subscribe({
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

    const cotizacionData=buildRusRequest(this.form,this.codigoInfoAuto);

    this.s_rus.cotizar(cotizacionData).subscribe({
      next: (response) => {
        console.log('✅ Cotización exitosa en RUS:', response.dtoList);

        const cotizacionesRus = response.dtoList;


    const cotizacionRUS = construirCotizacionRus(cotizacionesRus);
    console.log(cotizacionRUS);

    this.cotizacionGenerada.emit(cotizacionRUS);



      },
      error: (error) => {
        this.cotizacion = false;

        console.error("❌ Error en cotizacion RUS:",
        error?.error?.error || "Error desconocido");

      }
    });
  }

  //MERCANTIL ANDINA
  cotizarMercantil()
  {

    const cotizacionData= buildMercantilRequest(this.form,this.codigoInfoAuto);

    this.s_ma.cotizar(cotizacionData).subscribe({  next: (response) => {

      console.log('✅ Cotización exitosa Mercantil Andina:', response);
      const cotizacionMercantil = construirCotizacionMercantil(response.resultado);
      console.log(cotizacionMercantil);
      this.cotizacionGenerada.emit(cotizacionMercantil);

    },
    error: (error) => {


      console.error("❌ Mercantil Andina Cotizacion Error:",
      error?.error?.error || "Error desconocido");

    }
  });

  }

  //Rivadavia
  cotizarRivadavia()
  {

    const cotizacion:DatosCotizacionRivadavia = buildRivadaviaRequest(
      this.form,
      this.codigoInfoAuto,
      this.codigoRivadavia,
      this.sumaRivadavia
    );

    this.s_riv.cotizarRivadavia(cotizacion).subscribe({
      next: (res) => {
       console.log('✅ Cotización exitosa Rvadavia:',res);

       const cotizacionRivadavia:Cotizacion= construirCotizacionRivadavia(res.coberturas);

       console.log(cotizacionRivadavia);

       this.cotizacionGenerada.emit(cotizacionRivadavia);

      },
      error: (err) => {
        console.log(err);
      }
    });
  }

  //Federacion patronal
  cotizarFederacion()
  {

    const cotizacionFederacion= buildFederacionRequest(this.form,this.codigoInfoAuto,this.tipoVehiculoFederacion,this.codigoPostalFederacion);

    this.s_fedPat.cotizarFederacion(cotizacionFederacion).subscribe({
      next: (res) => {
       console.log('✅ Cotización exitosa Federacion:',res);

       const cotizacionFederacion:Cotizacion= construirCotizacionFederacion(res.coberturas.planes);

       console.log(cotizacionFederacion);

       this.cotizacionGenerada.emit(cotizacionFederacion);
      },
      error: (err) => {
        console.log(err);
      }
    });

  }

  getForm()
  {
    return this.cotizacionForm.getRawValue();
  }

  getTipoVehiculo(){
    const form:CotizacionFormValue=this.getForm();
    return form.tipoInteres.descripcion;
  }


  cotizar()
  {
    this.form = this.getForm();
  this.cotizarRivadavia();

  this.cotizarATM();

  this.cotizarMercantil();
  this.cotizarRUS();

  //this.cotizarFederacion();


  }



  cotizarATM(){

    const xmlAtm=buildATMRequest(this.form,String(this.codigoInfoAuto));

    this.s_ATM.cotizarATM(xmlAtm).subscribe({
      next: (res) => {
       console.log('✅ Cotización exitosa ATM:');

    const resultado =parsearXML(res);

    const cotizacionATM = construirCotizacionATM(resultado);
    console.log(cotizacionATM);

    this.cotizacionGenerada.emit(cotizacionATM);

          },
          error: (err) => {
            console.log(err);
          }
        });
      }

}
