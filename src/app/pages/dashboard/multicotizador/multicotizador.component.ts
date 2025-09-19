// Angular
import { Component, EventEmitter, Inject, OnInit, Output, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

// RxJS
import { firstValueFrom } from 'rxjs';

// Terceros
import { ToastrService } from 'ngx-toastr';
import { NgSelectModule } from '@ng-select/ng-select';

// Servicios
import { RioUruguayService } from '../../../services/rio-uruguay.service';
import { MercantilAndinaService } from '../../../services/mercantil-andina.service';
import { InfoautoService } from '../../../services/infoauto.service';
import { RivadaviaService } from '../../../services/rivadavia.service';
import { FederacionService } from '../../../services/federacion.service';
import { AtmService } from '../../../services/atm.service';
import { AuthService } from '../../../services/auth.service';
import { SpinnerService } from '../../../services/spinner.service';
import { DignaService } from '../../../services/digna.service';

// Interfaces & Models
import { RusCotizado } from '../../../interfaces/cotizacionRioUruguay';
import { DatosCotizacionRivadavia } from '../../../interfaces/cotizacionRivadavia';
import { Cotizacion, CotizacionATM } from '../../../interfaces/cotizacion';
import { CotizacionFormValue } from '../../../interfaces/cotizacionFormValue';
import { Tipo, TipoId, TipoPersoneria, TipoVehiculo } from '../../../interfaces/tipos';
import { Cobertura } from '../../../interfaces/cobertura';
import { Provincia } from '../../../interfaces/provincia';
import { Year } from '../../../interfaces/year';
import { Productor } from '../../../models/productor.model';
import { Vehiculo } from '../../../interfaces/vehiculo';
import { Brand, Group, Model } from '../../../classes/infoauto';

// Enums
import { TipoDeUso } from '../../../enums/tiposDeUso';
import { ETipoVehiculo } from '../../../enums/tipoVehiculos';
import { ECobertura } from '../../../enums/Ecobertura';
import { ESpinner } from '../../../enums/ESpinner';

// Utils
import {
  downloadJSON, filterCars, formatDateSinceYear,
  getRandomNumber, opcionesDeCobertura,
  ordenarPorNombre,
  ordenarStrings
} from '../../../utils/utils';
import { filtrarModelosPorAnio, OPCIONES_SI_NO } from '../../../utils/formOptions';

// Builders
import { buildATMRequest, buildTooltipATM, construirCotizacionATM, parsearXML } from './cotizadores/atm';
import { buildRusRequest, construirCotizacionRus } from './cotizadores/rioUruguay';
import { buildFederacionRequest, construirCotizacionFederacion, franquiciaUnPorCiento, franquiciaCuatroPorCiento, franquiciaDosPorCiento, franquiciaSeisPorCiento, sinFranquicia } from './cotizadores/federacionPatronal';
import { buildMercantilRequest, construirCotizacionMercantil } from './cotizadores/mercantilAndina';
import { buildRivadaviaRequest, construirCotizacionRivadavia } from './cotizadores/rivadavia';
import { getGrupos, getMarcas, getModelos } from './cotizadores/infoauto';
import { Localidad, Zona } from '../../../interfaces/zonas';
import { ZonasUtils } from '../../../utils/zonas-utils';
import { ZonasService } from '../../../services/zonas.service';



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
  brand_idSelected = 0;
  group_idSelected = 0;
  anios: Year[] = [];

  // fed
  tipoPersona!: TipoPersoneria;
  tiposId: TipoId[] = [];
  tiposDeRastreadores: Tipo[] = [];

  mediosPago: Tipo[] = [];
  coberturas: Cobertura[] = [];
  franquicias: Tipo[] = [];

  // riv

  grupos: Group[] = [];
  modelos: Model[] = [];
  modelosTodos: Model[] = [];
  codigosUso: any[] = []; // ⚠️ podría tiparse
  anio = 0;
  codigoInfoAuto = 0;
  codigoRivadavia = '';
  sumaRivadavia = '';

  codigoPostalFederacion = 0;

  public readonly opcionesSiNo = OPCIONES_SI_NO;
  public tiposVehiculo: TipoVehiculo[] = [];

  cotizacionesRus: RusCotizado[] = [];
  cotizacion = true;
  tiposDeUso: TipoDeUso[] = [];
  productorLog!: Productor | null;
  cotizaciones: Cotizacion = { companiasCotizadas: [], nroCotizacion: 0 };
  animar = false;

  public coberturasATM: CotizacionATM[] = [];
  public buildTooltipATM = buildTooltipATM; // usado en template

  //zonas
  provincias: Provincia[] = [];
  selectedProvincia: Provincia | null = null;
  barrios: string[] = [];
  zonas: string[] = ['Zona Norte', 'Zona Sur', 'Zona Oeste', 'Fuera de AMBA'];
  localidades: string[] = [];
  partidos: string[] = [];
  private zonasUtils: ZonasUtils;
  cpOpciones: Localidad[] = [];

  //para spinner cp
  loadingCP = false;


  // filtro
  opcionesCobertura = opcionesDeCobertura;

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
    private cdr: ChangeDetectorRef,
    private zonasService: ZonasService,
  ) {
    this.zonasUtils = new ZonasUtils(zonasService);

  }

  async ngOnInit() {
    this.initForm();
    this.setupValueChanges();

    setTimeout(() => (this.animar = true), 5);
    this.productorLog = await this.s_auth.obtenerProductorLogueado();
  }

  // ===== Form =====
  private initForm(): void {
    this.cotizacionForm = this.fb.group({
      alarma: [true],
      anio: [{ value: null, disabled: true }, Validators.required],
      apellido: [''],
      cascoConosur: false,
      clausulaAjuste: [{ value: { codigo: 10, descripcion: '10%' }, disabled: true }],
      condicionFiscal: [{ id: 0, descripcion: '' }, Validators.required],
      controlSatelital: false,
      descuentoComision: 0,
      franquicia: [],
      tieneGnc: false,
      gnc: 0,
      grua: false,
      marca: [{ value: null, disabled: true }, Validators.required],
      medioPago: false,
      modelo: [{ value: null, disabled: true }, Validators.required],
      nombre: [''],
      nroId: [''],
      provincia: null,
      rastreador: false,
      tallerExclusivo: false,
      tieneRastreador: false,
      tipoId: 'DNI',
      tipoRefacturacion: [],
      tipoVigencia: [{ value: null }, Validators.required],
      tipoVehiculo: [{ value: null }, Validators.required],
      version: [{ value: null, disabled: true }, Validators.required],
      vigenciaDesde: [formatDateSinceYear(new Date()), Validators.required],
      vigenciaHasta: [{ value: null }],
      coberturasSeleccionadas: [[] as ECobertura[]],
      zona:"",
      partido:"",
      barrio:"",
      localidad:"",
      //mercantil
      inderLocalidad: [''],
      cpManual: [null],
      cpLocalidadGuarda: [{ value: null}],

    });

    this.s_http.get<Tipo[]>('assets/mediosPago.json').subscribe(d => (this.mediosPago = d));
    this.s_http.get<TipoId[]>('assets/tipoId.json').subscribe(d => (this.tiposId = d));
    this.s_http.get<Provincia[]>('assets/provincias.json').subscribe(d => (this.provincias = d));

    //this.cotizacionForm.get('cpLocalidadGuarda')?.disable();
    this.s_http.get<TipoVehiculo[]>('assets/tiposVehiculo.json').subscribe(d => (this.tiposVehiculo = d));
  }

  private setupValueChanges(): void {
    this.cotizacionForm.get('tipoVehiculo')?.valueChanges.subscribe(tipo => {
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

    this.cotizacionForm.get('marca')?.valueChanges.subscribe((idMarca: number) => {
      this.cotizacionForm.get('modelo')?.setValue(null);
      if (idMarca) {
        this.brand_idSelected = idMarca;
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

    this.cotizacionForm.get('anio')?.valueChanges.subscribe(anio => {
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

    this.cotizacionForm.get('version')?.valueChanges.subscribe((codia: number) => {
      if (codia) this.codigoInfoAuto = codia;
    });

    this.cotizacionForm.get('cpLocalidadGuarda')?.valueChanges.subscribe(zipCode => {
      if (zipCode && String(zipCode).length >= 4) {
        this.codigoPostalFederacion = zipCode;
      }
    });

    this.cotizacionForm.get('tieneRastreador')?.valueChanges.subscribe(r => {
      if (r) {
        this.s_fedPat.getRastreadores().subscribe(rastreadores => {
          if (rastreadores) this.tiposDeRastreadores = rastreadores;
        });
      }
    });

    // 🔹 Provincia
    this.cotizacionForm.get('provincia')?.valueChanges.subscribe((prov: Provincia) => {
      this.barrios = [];
      this.partidos = [];
      this.localidades = [];
      this.cpOpciones = [];
      this.cotizacionForm.get('cpLocalidadGuarda')?.reset();
      this.cotizacionForm.get('inderLocalidad')?.reset();
      this.cotizacionForm.get('cpManual')?.reset();

      this.selectedProvincia = prov ?? null;

      if (prov?.descripcion === 'Capital Federal') {
        this.zonasUtils.getBarriosIfCABA(prov).subscribe(b => (this.barrios = b));
      }

      const cpManualCtrl = this.cotizacionForm.get('cpManual');
      const cpLocalidadCtrl = this.cotizacionForm.get('cpLocalidadGuarda');

      if (prov?.descripcion === 'Buenos Aires' || prov?.descripcion === 'Capital Federal') {
        // 👉 solo se usa cpLocalidadGuarda
        cpLocalidadCtrl?.setValidators([Validators.required]);
        cpLocalidadCtrl?.disable();
        cpManualCtrl?.clearValidators();
        cpManualCtrl?.disable();
      } else {
        // 👉 solo se usa cpManual
        cpManualCtrl?.setValidators([Validators.required]);
        cpManualCtrl?.enable();
        cpLocalidadCtrl?.clearValidators();
        cpLocalidadCtrl?.disable();
      }

      cpManualCtrl?.updateValueAndValidity();
      cpLocalidadCtrl?.updateValueAndValidity();
    });

    // Cuando cambia la ZONA (Norte/Sur/Oeste)
    this.cotizacionForm.get('zona')?.valueChanges.subscribe((zonaKey: string) => {
      this.partidos = [];
      this.localidades = [];

      if (zonaKey) {
        this.zonasService.getPartidosByZona(zonaKey as any).subscribe(p => (this.partidos = p));
      }
    });

    const MSG_CP = 'Obteniendo código postal...';

    // ================== PARTIDO ==================
    this.cotizacionForm.get('partido')?.valueChanges.subscribe(partido => {
      this.localidades = [];
      if (!partido) return;

      this.zonasUtils.getLocalidadesByZona(partido).subscribe(localidades => {
        this.localidades = ordenarStrings(localidades);

        if (
          this.localidades.length === 0 &&
          this.selectedProvincia?.descripcion === 'Buenos Aires'
        ) {
          this.s_spinner
            .runWithSpinner(
              firstValueFrom(
                this.s_ma.obtenerLocalidadPorNombre(
                  partido,
                  this.selectedProvincia.provinciaRiv
                )
              ),
              ESpinner.Vaiven,
              MSG_CP
            )
            .then((data: Localidad[] | undefined) => {
              if (!data) return;
              this.cpOpciones = ordenarPorNombre(data);

              if (this.cpOpciones.length === 1) {
                this.cotizacionForm.get('cpLocalidadGuarda')?.setValue(this.cpOpciones[0].cp);
                this.cotizacionForm.get('inderLocalidad')?.setValue(this.cpOpciones[0].id);
              } else {
                this.cotizacionForm.get('cpLocalidadGuarda')?.reset();
                this.cotizacionForm.get('inderLocalidad')?.reset();
              }
            });
        }
      });
    });

    // ================== BARRIO (CABA) ==================
    this.cotizacionForm.get('barrio')?.valueChanges.subscribe(barrio => {
      if (barrio && this.selectedProvincia) {
        this.s_spinner
          .runWithSpinner(
            firstValueFrom(
              this.s_ma.obtenerLocalidadPorNombre(
                `CABA ${barrio}`,
                this.selectedProvincia.provinciaRiv
              )
            ),
            ESpinner.Vaiven,
            MSG_CP
          )
          .then((data: Localidad[] | undefined) => {
            if (!data) return;
            this.cpOpciones = ordenarPorNombre(data);

            if (this.cpOpciones.length === 1) {
              this.cotizacionForm.get('cpLocalidadGuarda')?.setValue(this.cpOpciones[0].cp);
              this.cotizacionForm.get('inderLocalidad')?.setValue(this.cpOpciones[0].id);
            } else {
              this.cotizacionForm.get('cpLocalidadGuarda')?.reset();
              this.cotizacionForm.get('inderLocalidad')?.reset();
            }
          });
      }
    });

    // ================== LOCALIDAD (Bs As u otra) ==================
    this.cotizacionForm.get('localidad')?.valueChanges.subscribe(localidad => {
      if (localidad && this.selectedProvincia) {
        this.s_spinner
          .runWithSpinner(
            firstValueFrom(
              this.s_ma.obtenerLocalidadPorNombre(
                localidad,
                this.selectedProvincia.provinciaRiv,
                this.cotizacionForm.get('partido')?.value
              )
            ),
            ESpinner.Vaiven,
            MSG_CP
          )
          .then((data: Localidad[] | undefined) => {

            if (!data) return;
            this.cpOpciones = ordenarPorNombre(data);

            this.cotizacionForm.get('cpLocalidadGuarda')?.setValue(this.cpOpciones[0].cp);
            this.cotizacionForm.get('inderLocalidad')?.setValue(this.cpOpciones[0].id);

          });
      }
    });

    // 🔹 Código Postal manual (para provincias distintas de Bs As o CABA)
    this.cotizacionForm.get('cpManual')?.valueChanges.subscribe(cp => {
      if (cp && String(cp).length >= 4) {
        this.s_spinner
          .runWithSpinner(
            firstValueFrom(
              this.s_ma.obtenerLocalidadPorCp(Number(cp))
            ),
            ESpinner.Vaiven,
            'Validando código postal...'
          )
          .then((data: any[] | undefined) => {
            if (!data || data.length === 0) return;

            const item = data[0];
            const cp = item.cp ?? null;
            const inder = item.id ?? null;

            if (cp && inder) {
               // emitEvent: evita que se vuelva a llamar en bucle.
              this.cotizacionForm.get('cpManual')?.setValue(cp, { emitEvent: false });
              this.cotizacionForm.get('inderLocalidad')?.setValue(inder);
            } else {
              this.cotizacionForm.get('cpManual')?.reset({ emitEvent: false });
              this.cotizacionForm.get('inderLocalidad')?.reset();
            }

          })

          .catch(err => {
            console.error("❌ Error validando CP manual:", err);
            this.cotizacionForm.get('cpLocalidadGuarda')?.reset();
            this.cotizacionForm.get('inderLocalidad')?.reset();
          });
      }
    });


  }


  onSelectCp(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    const match = this.cpOpciones.find(c => String(c.cp) === String(value));
    if (match) {
      this.cotizacionForm.get('cpLocalidadGuarda')?.setValue(match.cp);
      this.cotizacionForm.get('inderLocalidad')?.setValue(match.id);
    }
  }


  // ===== Infoauto =====
  private getMarcasInfoAuto() {
    getMarcas(this.s_infoauto, this.getTipoVehiculo()).subscribe({
      next: async (response: Brand[]) => {
        this.marcas = await filterCars(this.s_http, response);
        this.cdr.detectChanges();
      },
      error: err => console.error('Error:', err)
    });
  }

  private getGruposPorMarca(brandId: number) {
    getGrupos(this.s_infoauto, brandId, this.getTipoVehiculo()).subscribe({
      next: response => {
        this.grupos = response;
        this.cotizacionForm.get('modelo')?.enable();
        setTimeout(() => this.cdr.detectChanges(), 0);
      },
      error: err => console.error('Error:', err)
    });
  }

  private getModelosPorGrupoYMarca(brandId: number, groupId: number) {
    getModelos(this.s_infoauto, brandId, groupId, this.getTipoVehiculo()).subscribe({
      next: response => {
        this.modelosTodos = response;

        // calcular años
        const añosUnicos = new Set<number>();
        response.forEach((m: Model) => {
          const desde = m.prices_from ?? 0;
          const hasta = m.prices_to ?? new Date().getFullYear();
          for (let y = desde; y <= hasta; y++) añosUnicos.add(y);
        });

        this.anios = Array.from(añosUnicos)
          .sort((a, b) => b - a)
          .map(year => ({ year } as Year));

        if (this.anios.length > 2000) {
          let anios = this.anios.length;
          this.anios = [];
          for (let i = 1; i < 34; i++) {
            this.anios.push({ year: anios } as Year);
            anios--;
          }
        }

        this.cotizacionForm.get('anio')?.enable();
        this.cotizacionForm.get('version')?.disable();
        this.modelos = [];
        this.cotizacionForm.get('version')?.setValue(null);
        this.cdr.detectChanges();
      },
      error: err => {
        console.error('❌ Error modelos por grupo:', err);
        this.anios = [];
        this.cotizacionForm.get('anio')?.disable();
      }
    });
  }

  // ===== Utils =====
  compararClausula(op1: Tipo, op2: Tipo): boolean {
    return op1?.codigo === op2?.codigo;
  }

  private getForm() {
    return this.cotizacionForm.getRawValue();
  }

  private getTipoVehiculo() {
    const form: CotizacionFormValue = this.getForm();
    return form.tipoVehiculo.nombre;
  }

  private getCodigoPostal(): number {
    const prov = this.selectedProvincia?.descripcion;
    if (prov === 'Buenos Aires' || prov === 'Capital Federal') {
      return this.cotizacionForm.get('cpLocalidadGuarda')?.value;
    } else {
      return this.cotizacionForm.get('cpManual')?.value;
    }
  }


  // ===== Cotizaciones =====
  //RIO URUGUAY
    async cotizarRUS() {
      if (!this.productorLog) {
        console.error('❌ No hay productor logueado');
        return;
      }
      const cotizacionData=buildRusRequest(
        this.form,
        this.codigoInfoAuto,
        this.productorLog,
        this.getTipoVehiculo(),
        this.getCodigoPostal()
      );
      try {
        const observable$ = this.s_rus.cotizar(cotizacionData);
        const respuesta = await firstValueFrom(observable$);
        console.log('✅ Cotización exitosa RUS:', respuesta.dtoList);
        const cotizacionesRus = respuesta.dtoList;
        const cotizacionRUS = construirCotizacionRus(cotizacionesRus,this.getTipoVehiculo());
        this.cotizaciones.companiasCotizadas.push(cotizacionRUS);
      } catch (error:any) {

        console.error("❌ Error en cotizacion RUS:",
          error?.error?.error || "Error desconocido");

          this.s_toast.error(error?.error?.error,"Error al cotizar en Rio Uruguay");
      }

    }


  //MERCANTIL ANDINA
  async cotizarMercantil() {
    if (!this.productorLog) {
      console.error('❌ No hay productor logueado');
      return;
    }


  try {
      const cotizacionData = buildMercantilRequest(
        this.form,
        this.codigoInfoAuto,
        this.productorLog,
        this.getCodigoPostal()
      );


      const observable$ = this.s_ma.cotizar(cotizacionData);
      const respuesta = await firstValueFrom(observable$);

      console.log('✅ Cotización exitosa Mercantil Andina:', respuesta);
      const cotizacionMercantil = construirCotizacionMercantil(respuesta);
      this.cotizaciones.companiasCotizadas.push(cotizacionMercantil);
    } catch (error: any) {

      console.log("Error cotizacion mercantil", error);

      // intentar leer el mensaje
      const payload = error?.error?.message;
      let mensaje = payload || 'Error inesperado';

      this.s_toast.error(mensaje, "Error al cotizar en Mercantil Andina");

      console.error('❌ Error principal:', mensaje);
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
      this.productorLog,
      this.getCodigoPostal()
    );

    try {
      const observable$ = this.s_riv.cotizarRivadavia(cotizacion,this.getTipoVehiculo());
      const respuesta = await firstValueFrom(observable$);

      console.log('✅ Cotización exitosa Rivadavia:', respuesta);
      const cotizacionRivadavia = await construirCotizacionRivadavia(respuesta.coberturas);
      console.log(cotizacionRivadavia);
      this.cotizaciones.companiasCotizadas.push(cotizacionRivadavia);

    } catch (error: any) {
      console.log('❌ Rivadavia error bruto:', error);

      // El backend envía: { message: { code, message, fieldErrors[] } }
      const mObj = error?.error?.message;

      let msg: string;

      if (mObj && typeof mObj === 'object') {
        const base = mObj.message || 'Error de validación';
        const detalles = Array.isArray(mObj.fieldErrors)
          ? mObj.fieldErrors
              .map((e: any) => `${e.field}: ${e.message}`)
              .join(' · ')
          : '';

        msg = detalles ? `${base}: ${detalles}` : base;
      } else {
        // otros casos (string o HttpErrorResponse.message)
        msg =
          (typeof mObj === 'string' && mObj) ||
          error?.message ||
          JSON.stringify(error?.error?.message ?? error);
      }

      this.s_toast.error(msg, 'Error al cotizar en Rivadavia');
      console.error('❌ Error principal:', msg);
    }



  }

  //Federacion patronal

  async cotizarFederacion(franquicia: number) {
    if (!this.productorLog) {
      console.error('❌ No hay productor logueado');
      return;
    }

    const cotizacionFederacion = buildFederacionRequest(
      this.form,
      this.codigoInfoAuto,
      this.productorLog,
      this.getTipoVehiculo(),
      franquicia
    );

    try {
      const respuesta = await firstValueFrom(
        this.s_fedPat.cotizarFederacion(
          cotizacionFederacion,
          this.codigoPostalFederacion,
          this.getTipoVehiculo(),
        )
      );

      console.log('✅ Cotización exitosa Federación:', respuesta);

      // 👉 franquicia realmente aplicada por el WS (fallback a la enviada)
      const franqResp = Number(respuesta?.coberturas?.franquicia) || franquicia;
      if (franqResp !== franquicia) {
        console.warn('[FED] Mismatch franquicia: enviada', franquicia, 'devuelta', franqResp);
      }

      // 👉 evitar cargar dos veces la misma franquicia (p.ej. 106 repetida)
      (this as any).__fed_frans_ok ??= new Set<number>();
      if ((this as any).__fed_frans_ok.has(franqResp)) {
        console.warn('[FED] Franquicia duplicada recibida:', franqResp, '→ omito asignar');
        return;
      }
      (this as any).__fed_frans_ok.add(franqResp);

      // ⚠️ pasar la franquicia DEVUELTA a construirCotizacionFederacion
      const parcial = construirCotizacionFederacion(
        respuesta?.coberturas?.planes ?? [],
        respuesta?.coberturas?.franquicia,
        this.getTipoVehiculo(),
        respuesta?.coberturas?.ajuste_automatico,
        respuesta?.vehiculo?.suma_asegurada
      );

      // 🔑 1) Asegurar UNA sola fila “Federación Patronal” (upsert sin duplicar)
      let fila = this.cotizaciones.companiasCotizadas.find(x => x.compania === 'Federación Patronal');
      if (!fila) {
        fila = {
          compania: 'Federación Patronal',
          rc: undefined, b1: undefined, b2: undefined,
          c: undefined, c1: undefined,c2:undefined, c3:undefined,
          d1: undefined, d2: undefined, d3: undefined, d4: undefined,
          detallesPorCodigo: {},
          rol2codigo: {},
          rol2tooltip: {},
          detalles: {}
        };
        this.cotizaciones.companiasCotizadas.push(fila);
      }

      // ✅ 2a) Merge de mapas para tooltips (no pisa claves existentes)
      fila.detallesPorCodigo = {
        ...(fila.detallesPorCodigo || {}),
        ...(parcial.detallesPorCodigo || {})
      };
      fila.rol2codigo = {
        ...(fila.rol2codigo || {}),
        ...(parcial.rol2codigo || {})
      };
      fila.rol2tooltip = {
        ...(fila.rol2tooltip || {}),
        ...(parcial.rol2tooltip || {})
      };
      fila.detalles = {
        ...(fila.detalles || {}),
        ...(parcial.detalles || {})
      };

      // 🔑 2) Solo completar comunes si aún no están
      if (fila.rc === undefined && parcial.rc !== undefined) fila.rc = parcial.rc;
      if (fila.b1 === undefined && parcial.b1 !== undefined) fila.b1 = parcial.b1;
      if (fila.b2 === undefined && parcial.b2 !== undefined) fila.b2 = parcial.b2;
      if (fila.c  === undefined && parcial.c  !== undefined) fila.c  = parcial.c;
      if (fila.c1 === undefined && parcial.c1 !== undefined) fila.c1 = parcial.c1;
      if (fila.c2 === undefined && parcial.c2 !== undefined) fila.c2 = parcial.c2;
      if (fila.c3 === undefined && parcial.c3 !== undefined) fila.c3 = parcial.c3;

      // 🔑 3) Guardar todas las variantes de Todo Riesgo
      if (parcial.d1 !== undefined) fila.d1 = parcial.d1;
      if (parcial.d2 !== undefined) fila.d2 = parcial.d2;
      if (parcial.d3 !== undefined) fila.d3 = parcial.d3;
      if (parcial.d4 !== undefined) fila.d4 = parcial.d4;

    } catch (error: any) {
      console.error('❌ Error en cotización Federación:', error);

      const msg =
        error?.error?.message ||
        error?.message ||
        (typeof error === 'string' ? error : JSON.stringify(error));

      this.s_toast.error(msg, 'Error al cotizar en Federación Patronal');

      const esRelacionMulti = msg.includes('Error al insertar relacion entre cotizaciones multirramicas');

      // asegurar fila única aunque falle
      let fila = this.cotizaciones.companiasCotizadas.find(x => x.compania === 'Federación Patronal');
      if (!fila) {
        fila = { compania: 'Federación Patronal', rc: undefined, c: undefined, c1: undefined, d1: undefined, d2: undefined, d3: undefined, d4: undefined };
        this.cotizaciones.companiasCotizadas.push(fila);
      }

      if (esRelacionMulti) {
        (fila as any).d2 = undefined;
      }

      console.error('❌ Error principal:', msg);
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
      this.getTipoVehiculo(),
      this.getCodigoPostal()
    );

    try {
      const respuesta = await firstValueFrom(this.s_ATM.cotizarATM(xmlAtm, this.productorLog));
      //console.log(respuesta);  //en crudo
      console.log('✅ Cotización exitosa ATM');

      const resultado = parsearXML(respuesta);
      this.coberturasATM = resultado;

      const cotizacionATM = construirCotizacionATM(resultado);
      this.cotizaciones.companiasCotizadas.push(cotizacionATM);
    } catch (error:any) {
      console.error('❌ Error en cotización ATM:', error);
      this.s_toast.error(error, "Error en cotización ATM");
    }
  }


  //Digna
  async cotizarDigna(){
    console.log("Cotizando DIgna");
  }


  // ===== Filtros =====
  onCoberturaChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const selected = this.cotizacionForm.get('coberturasSeleccionadas')?.value || [];
    this.cotizacionForm.patchValue({
      coberturasSeleccionadas: input.checked
        ? [...selected, input.value]
        : selected.filter((id: string) => id !== input.value)
    });
  }

  private delay(ms: number): Promise<void> {
    return new Promise(res => setTimeout(res, ms));
  }

  // ===== Ejecutar cotización =====
  async cotizar() {
    this.form = this.getForm();
    const esMoto = this.getTipoVehiculo() == ETipoVehiculo.MOTOVEHICULO;

     //Elegir CP según provincia
      const cp = this.selectedProvincia?.descripcion === 'Buenos Aires'
      || this.selectedProvincia?.descripcion === 'Capital Federal'
    ? this.cotizacionForm.get('cpLocalidadGuarda')?.value
    : this.cotizacionForm.get('cpManual')?.value;


    this.codigoPostalFederacion = cp;

    console.log(this.codigoPostalFederacion);


    const tareaFederacion = async () => {
      if (esMoto) {
        await this.cotizarFederacion(sinFranquicia);
      } else {
        await this.cotizarFederacion(franquiciaUnPorCiento);
        await this.delay(200);
        await this.cotizarFederacion(franquiciaDosPorCiento);
        await this.delay(200);
        await this.cotizarFederacion(franquiciaCuatroPorCiento);
        await this.delay(200);
        await this.cotizarFederacion(franquiciaSeisPorCiento);
      }
    };

    const tareas = [
      tareaFederacion,
      () => this.cotizarRivadavia(),
      () => this.cotizarRUS(),
      () => this.cotizarMercantil(),
      () => this.cotizarATM(),
      () => this.cotizarDigna()
    ];

    this.s_spinner.show(ESpinner.Rebote);
    try {
      await Promise.allSettled(tareas.map(fn => fn()));
      this.cotizaciones.nroCotizacion = getRandomNumber();
    } finally {
      this.s_spinner.hide(ESpinner.Rebote);
    }

    this.router.navigate(['/dashboard/tabla-cotizadora'], {
      state: {
        cotizaciones: this.cotizaciones,
        tipoVehiculo: this.getTipoVehiculo(),
        coberturasATM: this.coberturasATM,
        coberturasSeleccionadas: this.form.coberturasSeleccionadas,
        vehiculo: {
          marca: this.marcas.find(m => m.id === this.form.marca)?.name || '',
          modelo: this.grupos.find(g => g.id === this.form.modelo)?.name || '',
          version: this.modelos.find(v => v.codia === this.form.version)?.description || '',
          anio: this.form.anio
        } as Vehiculo
      }
    });



  }
}
