import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RioUruguayService } from '../../../services/rio-uruguay.service';
import { RusCotizado } from '../../../interfaces/cotizacionRioUruguay';
import { MercantilAndinaService } from '../../../services/mercantil-andina.service';
import { TipoDeUso } from '../../../enums/tiposDeUso';
import { ChangeDetectorRef } from '@angular/core';
import { InfoautoService } from '../../../services/infoauto.service';
import { Brand, Group, Model } from '../../../classes/infoauto';
import { RivadaviaService } from '../../../services/rivadavia.service';
import {  DatosCotizacionRivadavia} from '../../../interfaces/cotizacionRivadavia';
import { FederacionService } from '../../../services/federacion.service';
import {LocalidadesFederacion } from '../../../interfaces/cotizacionfederacion';
import { AtmService } from '../../../services/atm.service';
import { CotizacionFormValue } from '../../../interfaces/cotizacionFormValue';
import { Tipo, TipoId, TipoPersoneria, TipoVehiculo } from '../../../interfaces/tipos';
import { Cobertura } from '../../../interfaces/cobertura';
import { NgSelectModule } from '@ng-select/ng-select';
import { downloadJSON, filterCars, formatDateSinceDay, formatDateSinceYear, getRandomNumber } from '../../../utils/utils';
import { buildATMRequest, construirCotizacionATM, parsearXML } from './cotizadores/atm';
import { buildRusRequest, construirCotizacionRus } from './cotizadores/rioUruguay';
import { Cotizacion } from '../../../interfaces/cotizacion';
import { buildFederacionRequest, construirCotizacionFederacion } from './cotizadores/federacionPatronal';
import { buildMercantilRequest, construirCotizacionMercantil } from './cotizadores/mercantilAndina';
import { buildRivadaviaRequest, construirCotizacionRivadavia } from './cotizadores/rivadavia';
import { getGrupos, getMarcas, getModelos } from './cotizadores/infoauto';
import { filtrarModelosPorAnio, OPCIONES_SI_NO } from '../../../utils/formOptions';
import { Provincia } from '../../../interfaces/provincia';
import { Year } from '../../../interfaces/year';
import { AuthService } from '../../../services/auth.service';
import { Productor } from '../../../models/productor.model';
import { Router } from '@angular/router';
import { ESpinner } from '../../../enums/ESpinner';
import { SpinnerService } from '../../../services/spinner.service';
import { firstValueFrom } from 'rxjs';
import { DignaService } from '../../../services/digna.service';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';

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

  marcas: Brand[] = [];
  brand_idSelected:number=0;
  group_idSelected:number=0;
  anios: Year[] = [];
  //fed
  tipoPersona!: TipoPersoneria;
  tiposId:TipoId[]=[];
  tiposDeRastreadores:Tipo[]=[];

  mediosPago:Tipo[]=[];
  coberturas:Cobertura[]=[];
  franquicias:Tipo[]=[];

  //riv
  provincias:Provincia[]=[];
  grupos: Group[] = [];
  modelos: Model[] = [];
  modelosTodos: Model[] = [];
  codigosUso: any[] = [];
  anio:number=0;
  codigoInfoAuto:number=0;
  codigoRivadavia:string="";
  sumaRivadavia:string="";

  codigoPostalFederacion:number=0;

  public readonly opcionesSiNo = OPCIONES_SI_NO;

  public tiposVehiculo:TipoVehiculo[] = [];

  cotizacionesRus: RusCotizado[] = [];
  cotizacion:boolean=true;
  tiposDeUso: TipoDeUso[]= [];
  productorLog!: Productor|null;
  cotizaciones: Cotizacion;
  animar:boolean = false;


  constructor(
    @Inject(RioUruguayService) private s_rus: RioUruguayService,
    @Inject(MercantilAndinaService) private s_ma: MercantilAndinaService,
    @Inject(InfoautoService) private s_infoauto: InfoautoService,
    @Inject(RivadaviaService) private s_riv: RivadaviaService,
    @Inject(FederacionService) private s_fedPat: FederacionService,
    @Inject(AtmService) private s_ATM: AtmService,
    @Inject(AuthService) private s_auth: AuthService,
    @Inject(Router) private router: Router,
    @Inject(SpinnerService) private s_spinner: SpinnerService,
    @Inject(DignaService) private s_digna: DignaService,
    @Inject(ToastrService) private s_toast: ToastrService,
    @Inject(HttpClient) private s_http: HttpClient,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ){
    this.cotizaciones={companiasCotizadas:[],nroCotizacion:0};
  }

  async ngOnInit() {
    this.initForm();
    this.setupValueChanges();
    setTimeout(() => {
      this.animar = true;
    }, 5);
    this.productorLog= await this.s_auth.obtenerProductorLogueado();
  }


  private initForm(): void {
    this.cotizacionForm = this.fb.group({
      alarma: [true],
      anio: [{ value: null, disabled: true }, Validators.required],
      apellido: [""],
      cascoConosur:false,
      clausulaAjuste: [{ value: { codigo: 10, descripcion: '10%' }, disabled: true }],
      condicionFiscal: [{id: 0, descripcion: ''}, Validators.required],
      controlSatelital: false,
      cpLocalidadGuarda: [{ value: null }, Validators.required],
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
      tipoVehiculo: [{ value: null}, Validators.required],
      version: [{ value: null, disabled: true }, Validators.required],
      vigenciaDesde: [formatDateSinceYear(new Date()), Validators.required],
      vigenciaHasta: [{ value: null }],
    });

    this.s_http.get<Tipo[]>('assets/mediosPago.json').subscribe(data => {
      this.mediosPago = data;
    });

    this.s_http.get<any[]>('assets/tipoId.json').subscribe(data => {
      this.tiposId = data;
    });


    this.s_http.get<Provincia[]>('assets/provincias.json').subscribe(data => {
      this.provincias = data;
    });

    this.s_http.get<TipoVehiculo[]>('assets/tiposVehiculo.json').subscribe(data => {
      this.tiposVehiculo = data;
    });

  }

      //COmparar clausulas para dar una por defecto.
     compararClausula(op1: Tipo, op2: Tipo): boolean {
        return op1?.codigo === op2?.codigo;
      }




      getMarcasInfoAuto() {
        getMarcas(this.s_infoauto, this.getTipoVehiculo()).subscribe({
          next: async (response: Brand[]) => {

            this.marcas = await filterCars(this.s_http,response);
            this.cdr.detectChanges();
          },
          error: (error) => {
            console.error('Error:', error);
          },
        });
      }

      getGruposPorMarca(brandId: number) {
        getGrupos(this.s_infoauto, brandId, this.getTipoVehiculo()).subscribe({
          next: (response) => {
            console.log(response);
          this.grupos = response;
          this.cotizacionForm.get('modelo')?.enable();

          setTimeout(() => this.cdr.detectChanges(), 0);

          },
          error: (error) => {
            console.error('Error:', error);
          },
        });
      }

  getModelosPorGrupoYMarca(brandId: number, groupId: number) {

  getModelos(this.s_infoauto, brandId, groupId, this.getTipoVehiculo()).subscribe({
    next: (response) => {

      this.modelosTodos = response;
      console.log(this.modelosTodos);
      // Extraer años únicos desde los modelos (desde prices_from hasta prices_to)
      const añosUnicos = new Set<number>();

      response.forEach((modelo:Model) => {
        const desde = modelo.prices_from ?? 0;
        const hasta = modelo.prices_to ?? new Date().getFullYear();
        for (let y = desde; y <= hasta; y++) {
          añosUnicos.add(y);
        }
      });

      this.anios = Array.from(añosUnicos)
        .sort((a, b) => b - a)
        .map(year => ({ year } as Year));

      if(this.anios.length>2000){
        var anios=this.anios.length;

        this.anios=[];
        //Si no tiene rangos validos le pongo 34 ultimos anios
        for (let index = 1; index < 34; index++) {
          var anio :Year = {year:anios};
          anios--;
          this.anios.push(anio);

        }
      }
      this.cotizacionForm.get('anio')?.enable();
      this.cotizacionForm.get('version')?.disable();
      this.modelos = [];
      this.cotizacionForm.get('version')?.setValue(null);
      this.cdr.detectChanges();
    },
    error: (error) => {
      console.error('❌ Error modelos por grupo:', error);
      this.anios = [];
      this.cotizacionForm.get('anio')?.disable();
    },
  });
}


  //subscripciones a form
  private setupValueChanges(): void {

    this.cotizacionForm.get('tipoVehiculo')?.valueChanges.subscribe((tipo) => {


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
      this.cotizacionForm.get('modelo')?.setValue(null);
      if (idMarca) {
        this.brand_idSelected=idMarca;
        this.getGruposPorMarca(this.brand_idSelected);
      } else {
        this.cotizacionForm.get('modelo')?.disable();
      }
    });


   this.cotizacionForm.get('modelo')?.valueChanges.subscribe((idModelo: number) => {
      this.cotizacionForm.get('anio')?.setValue(null);
      this.cotizacionForm.get('version')?.disable();
      this.anios = [];
      if (idModelo) {
        this.group_idSelected = idModelo;
        this.getModelosPorGrupoYMarca(this.brand_idSelected, this.group_idSelected);
      } else {
        this.modelos = [];
        this.cotizacionForm.get('anio')?.disable();
      }
    });


 this.cotizacionForm.get('anio')?.valueChanges.subscribe((anio) => {
  this.cotizacionForm.get('version')?.setValue(null);

  if (anio && this.modelosTodos.length > 0) {
    this.anio = anio;

    this.modelos = filtrarModelosPorAnio(this.modelosTodos, this.anio);


    this.cotizacionForm.get('version')?.enable();
  } else {
    this.modelos = [];
    this.cotizacionForm.get('version')?.disable();
  }

  this.cdr.detectChanges();
});



    //Para traer codigo de Rivadavia y franquicia federacion.
    this.cotizacionForm.get('version')?.valueChanges.subscribe((codia:number) =>
    {

      if (codia) {

      console.log(codia);
      this.codigoInfoAuto=codia;
      }
    });

    this.cotizacionForm.get('cpLocalidadGuarda')?.valueChanges.subscribe((zipCode) => {
      if (zipCode) {
        const zipCodeString=String(zipCode);
        if(zipCodeString.length>=4)
        this.codigoPostalFederacion=zipCode;

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
    async cotizarRUS() {
      if (!this.productorLog) {
        console.error('❌ No hay productor logueado');
        return;
      }
      const cotizacionData=buildRusRequest(this.form,this.codigoInfoAuto,this.productorLog,this.getTipoVehiculo());
      try {
        const observable$ = this.s_rus.cotizar(cotizacionData);
        const respuesta = await firstValueFrom(observable$);
        console.log('✅ Cotización exitosa RUS:', respuesta.dtoList);
        const cotizacionesRus = respuesta.dtoList;
        const cotizacionRUS = construirCotizacionRus(cotizacionesRus);
        this.cotizaciones.companiasCotizadas.push(cotizacionRUS);
      } catch (error:any) {

        console.error("❌ Error en cotizacion RUS:",
          error?.error?.error || "Error desconocido");
      }

    }


  //MERCANTIL ANDINA
  async cotizarMercantil() {
    if (!this.productorLog) {
      console.error('❌ No hay productor logueado');
      return;
    }

    const cotizacionData = buildMercantilRequest(
      this.form,
      this.codigoInfoAuto,
      this.productorLog
    );

    try {
      const observable$ = this.s_ma.cotizar(cotizacionData);
      const respuesta = await firstValueFrom(observable$);

      console.log('✅ Cotización exitosa Mercantil Andina:', respuesta);
      const cotizacionMercantil = construirCotizacionMercantil(respuesta.resultado);
      this.cotizaciones.companiasCotizadas.push(cotizacionMercantil);
    } catch (error: any) {
      const payload = error?.error?.message;
      let mensaje = 'Error inesperado';
      let detalle = '';

      try {
        const parsed = typeof payload === 'string' ? JSON.parse(payload) : payload;
        mensaje = parsed?.message || mensaje;
        detalle = parsed?.errors?.[0]?.message || '';
      } catch (e) {
        console.error('❌ Error desconocido al parsear:', error);
      }

      console.error('❌ Error principal:', mensaje);
      console.warn('🧾 Detalle técnico:', detalle);
    }
  }

  //Rivadavia
  async cotizarRivadavia() {
    if (!this.productorLog) {
      console.error('❌ No hay productor logueado');
      return;
    }


    const cotizacion: DatosCotizacionRivadavia = buildRivadaviaRequest(
      this.form,
      this.codigoInfoAuto,
      this.productorLog
    );

    try {
      const observable$ = this.s_riv.cotizarRivadavia(cotizacion,this.getTipoVehiculo());
      const respuesta = await firstValueFrom(observable$);

      console.log('✅ Cotización exitosa Rivadavia:', respuesta);
      const cotizacionRivadavia = construirCotizacionRivadavia(respuesta.coberturas,this.getTipoVehiculo());
      console.log(cotizacionRivadavia);
      this.cotizaciones.companiasCotizadas.push(cotizacionRivadavia);

    } catch (error) {
      console.log(error);
    }

  }

  //Federacion patronal

    async cotizarFederacion() {
      if (!this.productorLog) {
        console.error('❌ No hay productor logueado');
        return;
      }

      const cotizacionFederacion = buildFederacionRequest(
        this.form,
        this.codigoInfoAuto,
        this.productorLog,
        this.getTipoVehiculo()
      );

      try {

        const respuesta = await firstValueFrom(this.s_fedPat.cotizarFederacion(cotizacionFederacion,this.codigoPostalFederacion,this.getTipoVehiculo()));

        console.log('✅ Cotización exitosa Federación:', respuesta);
        const cotizacion = construirCotizacionFederacion(respuesta.coberturas.planes);
        this.cotizaciones.companiasCotizadas.push(cotizacion);
      } catch (error) {
        console.error('❌ Error en cotización Federación:', error);
      }
    }


  //ATM

  async cotizarATM() {
    if (!this.productorLog) {
      console.error('❌ No hay productor logueado');
      return;
    }

    const xmlAtm = buildATMRequest(
      this.form,
      String(this.codigoInfoAuto),
      this.productorLog,
      this.getTipoVehiculo()
    );

    try {
      const respuesta = await firstValueFrom(this.s_ATM.cotizarATM(xmlAtm,this.productorLog));
      console.log(respuesta);
      console.log('✅ Cotización exitosa ATM');
      const resultado = parsearXML(respuesta);
      const cotizacionATM = construirCotizacionATM(resultado);
      this.cotizaciones.companiasCotizadas.push(cotizacionATM);
    } catch (error) {
      console.error('❌ Error en cotización ATM:', error);
    }
  }


  //Digna
  async cotizarDigna(){
    console.log("Cotizando DIgna");
  }



  getForm()
  {

    return this.cotizacionForm.getRawValue();
  }

  getTipoVehiculo(){
    const form:CotizacionFormValue=this.getForm();
    return form.tipoVehiculo.nombre;
  }


  async cotizar() {
    this.form = this.getForm();

    const tareas = [
      () => this.cotizarRivadavia(),
      () => this.cotizarRUS(),
      () => this.cotizarMercantil(),
      () => this.cotizarATM(),
      () => this.cotizarFederacion(),
      ()=> this.cotizarDigna(),
    ];

    // Mostramos spinner manualmente
    this.s_spinner.show(ESpinner.Rebote);

    try {
      const promesas = tareas.map(fn => fn());
      await Promise.allSettled(promesas);
      this.cotizaciones.nroCotizacion=getRandomNumber();
    } finally {

      // Lo ocultamos solo cuando todas realmente terminaron
      this.s_spinner.hide(ESpinner.Rebote);
    }

    // Redirigir a la tabla
    this.router.navigate(['/dashboard/tabla-cotizadora'], {
      state: {
        cotizaciones: this.cotizaciones
      }
    });
  }
}
