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
import {  DatosCotizacionRivadavia} from '../../interfaces/cotizacionRivadavia';
import { FederacionService } from '../../services/federacion.service';
import {LocalidadesFederacion } from '../../interfaces/cotizacionfederacion';
import { AtmService } from '../../services/atm.service';
import { CotizacionFormValue } from '../../interfaces/cotizacionFormValue';
import { Tipo, TipoId, TipoPersoneria, TipoRefacturacion, TipoVehiculo } from '../../interfaces/tipos';
import { Cobertura } from '../../interfaces/cobertura';
import { NgSelectModule } from '@ng-select/ng-select';
import { downloadJSON, formatDateSinceDay, formatDateSinceYear } from './utils/utils';
import { buildATMRequest, construirCotizacionATM, parsearXML } from './cotizadores/atm';
import { buildRusRequest, construirCotizacionRus } from './cotizadores/rioUruguay';
import { Cotizacion } from '../../interfaces/cotizacion';
import { buildFederacionRequest, construirCotizacionFederacion } from './cotizadores/federacionPatronal';
import { buildMercantilRequest, construirCotizacionMercantil } from './cotizadores/mercantilAndina';
import { buildRivadaviaRequest, construirCotizacionRivadavia } from './cotizadores/rivadavia';
import { getAniosPorGrupo, getGrupos, getMarcas, getModelos } from './cotizadores/infoauto';
import { DESCUENTOS_COMISION, filtrarModelosPorAnio, MEDIOS_PAGO, OPCIONES_SI_NO, PROVINCIAS, TIPOS_ID, TIPOS_REFACTURACION, TIPOS_VEHICULO, TIPOS_VIGENCIA } from './utils/formOptions';
import { Provincia } from '../../interfaces/provincia';
import { Year } from '../../interfaces/year';
import { AuthService } from '../../services/auth.service';
import { Productor } from '../../models/productor.model';

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
  anios: Year[] = [];
  //fed
  tipoPersona!: TipoPersoneria;
  tiposId:TipoId[]=[];
  tiposDeRastreadores:Tipo[]=[];
  tiposDeRefacturacion:TipoRefacturacion[]=[];
  descuentoComision:Tipo[]=[];
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

  codigoPostalFederacion:string="";
  tipoVehiculoFederacion:number=0;

  cotizacionesRus: RusCotizado[] = [];
  cotizacion:boolean=true;
  tiposDeUso: TipoDeUso[]= [];
  productorLog!: Productor|null;

  constructor(
    @Inject(RioUruguayService) private s_rus: RioUruguayService,
    @Inject(MercantilAndinaService) private s_ma: MercantilAndinaService,
    @Inject(InfoautoService) private s_infoauto: InfoautoService,
    @Inject(RivadaviaService) private s_riv: RivadaviaService,
    @Inject(FederacionService) private s_fedPat: FederacionService,
    @Inject(AtmService) private s_ATM: AtmService,
    @Inject(AuthService) private s_auth: AuthService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ){

  }

  async ngOnInit() {
    this.initForm();
    this.setupValueChanges();
    this.productorLog= await this.s_auth.obtenerProductorLogueado();
    console.log(this.productorLog);
  }
  public readonly opcionesSiNo = OPCIONES_SI_NO;

  public tiposVehiculo:TipoVehiculo[] = [];

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

    this.tiposId=TIPOS_ID;

    this.tiposDeRefacturacion=TIPOS_REFACTURACION;

   //ver con el planchon
    this.descuentoComision =DESCUENTOS_COMISION;

    this.mediosPago=MEDIOS_PAGO;

    this.provincias=PROVINCIAS;

    this.tiposVehiculo=TIPOS_VEHICULO;

  }

      //COmparar clausulas para dar una por defecto.
     compararClausula(op1: Tipo, op2: Tipo): boolean {
        return op1?.codigo === op2?.codigo;
      }




      getMarcasInfoAuto() {
        getMarcas(this.s_infoauto, this.getTipoVehiculo()).subscribe({
          next: (response: Brand[]) => {
            console.log(response);
            this.marcas = response;
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

          // Forzar render async para asegurar que el ng-select detecte el cambio
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
    if (!this.productorLog) {
      console.error('❌ No hay productor logueado');
      return;
    }
    const cotizacionData=buildRusRequest(this.form,this.codigoInfoAuto,this.productorLog);

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
    if (!this.productorLog) {
      console.error('❌ No hay productor logueado');
      return;
    }
    const cotizacionData= buildMercantilRequest(
      this.form,
      this.codigoInfoAuto,
      this.productorLog);

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
    if (!this.productorLog) {
      console.error('❌ No hay productor logueado');
      return;
    }
    const cotizacion:DatosCotizacionRivadavia = buildRivadaviaRequest(
      this.form,
      this.codigoInfoAuto,
      this.codigoRivadavia,
      this.sumaRivadavia,
      this.productorLog
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
    if (!this.productorLog) {
      console.error('❌ No hay productor logueado');
      return;
    }
    const cotizacionFederacion= buildFederacionRequest(
      this.form,this.codigoInfoAuto,
      this.tipoVehiculoFederacion,
      this.codigoPostalFederacion,
      this.productorLog);

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
    return form.tipoVehiculo.nombre;
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
if (!this.productorLog) {
  console.error('❌ No hay productor logueado');
  return;
}

    const xmlAtm=buildATMRequest(
      this.form,String(this.codigoInfoAuto),
      this.productorLog);

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
