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
@Component({
  selector: 'app-multicotizador',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './multicotizador.component.html',
  styleUrl: './multicotizador.component.css'
})
export class MulticotizadorComponent implements OnInit {

  cotizacionForm!: FormGroup;
  marcas: any[] = [];
  anios: number[] = [];
  tipoVehiculo:string="";
  codigoTipoInteres:string='';
  codModelo:number=0;
  gnc:boolean=false;
  modelos: any[] = [];
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
/*
    this.s_infoauto.getToken().subscribe({
      next:(data:any)=>{
        console.log(data);
      },
      error:(error)=>{
        console.log('error en token:',error);
      }
    });*/

    this.s_infoauto.obtenerMarcas().subscribe({
      next: (response) => {
        console.log(response);
      },
      error: (error) => {
        console.error('Error:', error);

      }
    });

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

  public readonly cuotas=
  [
    1,2,3,4,5,6
  ];

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
    console.log(idNumber);
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
    console.log(vehiculo);

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
      codigoTipoInteres: [{value:null}],
      tipoVehiculo: [{ value: null, disabled: true }],
      marca: [{ value: null, disabled: true }],
      anio: [{ value: null, disabled: true }],
      modelo: [{ value: null, disabled: true }],
      version: [{ value: null, disabled: true }],
      uso: [{ value: null, disabled: true }],
      codigoUso: [{ value: null, disabled: true }],
      tipoVigencia:[{value:null}],
      cuotas: [{ value: null }],
      clausulaAjuste: [{value:null}],
      condicionFiscal:[{value:null}],
      cpLocalidadGuarda:[{value:null}],
      controlSatelital:[{value:null}],
      gnc:[{value:null}],
      vigenciaDesde:[this.formatDate(new Date())],
      vigenciaHasta:[{value:null}]

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
        this.obtenerMarcasRUS(tipo);
        this.cotizacionForm.get('uso')?.enable();
      } else {
        this.marcas = [];
        this.cotizacionForm.get('marca')?.disable();
        this.cotizacionForm.get('uso')?.disable();
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
        this.obtenerModelosRUS();
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
        this.obtenerVersionesRUS();
       //this.obtenerVersionesMA();
      } else {
        this.versiones = [];
        this.cotizacionForm.get('version')?.disable();
      }
    });

  }


  //RIO URUGUAY

  private obtenerMarcasRUS(tipo: number): void {

    this.s_rus.getMarcas(tipo).subscribe({
      next: (data: any) => {
        this.marcas = data.dtoList;
        console.log(this.marcas);
        this.cotizacionForm.get('marca')?.enable();
      },
      error: (error) => console.error('Error al obtener las marcas:', error)
    });

  }

  private obtenerModelosRUS(): void {
    const { marca, anio, tipoVehiculo } = this.cotizacionForm.value;
    if (!marca || !anio) return;

    const tipo=Number(tipoVehiculo);

    this.s_rus.getModelos(marca.id, anio,tipo).subscribe({
      next: (data: any) => {
        this.modelos = data.dtoList;
        console.log(this.modelos);
        this.cotizacionForm.get('modelo')?.enable();
      },
      error: (error) => {
        console.error('Error al obtener los modelos:', error);
        this.modelos = [];
        this.cotizacionForm.get('modelo')?.disable();
      }
    });
  }

  private obtenerVersionesRUS(): void {
    const { modelo, anio, tipoVehiculo, marca } = this.cotizacionForm.value;
    if (!modelo) return;

    this.tipoVehiculo=tipoVehiculo;


    this.s_rus.getVersiones(modelo.id, anio, tipoVehiculo, marca).subscribe({
      next: (data: any) => {
        this.versiones = data.dtoList;
        console.log(data.dtoList);
        this.cotizacionForm.get('version')?.enable();
      },
      error: (error) => {
        console.error('Error al obtener las versiones:', error);
        this.versiones = [];
        this.cotizacionForm.get('version')?.disable();
      }
    });
  }

  cotizarRUS(): void {
    if (this.cotizacionForm.invalid) {
      console.warn('El formulario no es válido');
      return;
    }

    const formValues = this.cotizacionForm.value;

    if(this.tipoVehiculo=='7' ||this.tipoVehiculo=='8')
    {
      this.codigoTipoInteres='MOTOVEHICULO';
    }else{
      this.codigoTipoInteres='VEHICULO';
    }

    formValues.cpLocalidadGuarda

    const vehiculos: VehiculosRus[]=[{
        anio: String(formValues.anio),
        controlSatelital: this.getSiNo(formValues.controlSatelital),
        cpLocalidadGuarda:Number(formValues.cpLocalidadGuarda),
        gnc: this.getSiNo(formValues.gnc),
        modeloVehiculo: Number(formValues.version.id),
        uso: String(formValues.uso)
    }];



    const cotizacionData: CotizacionRioUruguay = {
      codigoProductor: 4504,
      codigoSolicitante: 4504,
      codigoTipoInteres: this.codigoTipoInteres,
      cuotas: Number(formValues.cuotas), //solo permite hasta 3
      ajusteAutomatico:Number(formValues.clausulaAjuste),
      condicionFiscal: this.getCondicionFiscal(formValues.condicionFiscal),
      tipoVigencia: this.getTiposVigencia(formValues.tipoVigencia),
      vehiculos: vehiculos,
      vigenciaDesde: formValues.vigenciaDesde,
      vigenciaHasta: formValues.vigenciaHasta,
      vigenciaPolizaId: 65 //autos
    };

    if(this.codigoTipoInteres!='VEHICULO')
    {
      cotizacionData.vigenciaPolizaId=70; //motos
    }

    console.log(cotizacionData);

    this.s_rus.cotizar(cotizacionData).subscribe({
      next: (response) => {
        console.log('Cotización exitosa:', response);
        this.cotizacion = true;
        this.cotizacionError='';
        this.cotizacionesRus = response.dtoList;


    console.log('Cotizaciones procesadas:', this.cotizacionesRus);
      },
      error: (error) => {
        this.cotizacion = false;
        this.cotizacionError = error.error?.error || "Error desconocido";
        console.error("Rio Uruguay Cotizacion Error:",
        error.error?.error || "Error desconocido");

      }
    });
  }

  limpiarEspacios(texto: string): string {
    return texto.replace(/\s+/g, ' ').trim();
}

  //MERCANTIL ANDINA


  obtenerCotizacionMercantil(
    cotizacion:CotizacionMercantil,
    marca:string,
    modelo:string,
    anio:number,
    version:string)
  {

    console.log(marca);
    console.log(modelo);
    console.log(anio);
    console.log('antes: ',version);

    version=this.limpiarEspacios(version);
    console.log('despues: ',version);
    if(cotizacion.tipo=="MOTOVEHICULO")
    {

      this.s_ma.obtenerMarcas().subscribe({
        next:(data:any)=> {
          console.log(data);
        }
      });

      const moto=marca+' '+version;
      this.s_ma.obtenerVehiculos(moto,anio,'MOTO').subscribe({
        next: (data: any) => {
          console.log(data.datos);

          if(cotizacion.vehiculo){
            cotizacion.vehiculo.infoauto= data.datos[0].codigo;
          }

          this.s_ma.cotizar(cotizacion).subscribe({
            next: (response) => {
              console.log("✅ Respuesta de la API MA moto:");

              const mercantilCotizado:MercantilCotizado=response;

              console.log(mercantilCotizado);

            },
            error: (error) => {
              console.error("Mercantil Andina Cotizacion Error:",
              error.error?.message || "Error desconocido");
            }
          });

        },
        error: (error) => console.error("Error al obtener las marcas:", error),
      });

        /*
      //const moto= marca
      const moto2=marca+' '+modelo+' '+version;
      const moto ="HONDA";
      console.log(moto);
      console.log(moto2);
      this.s_ma.obtenerVehiculos(moto,anio,'MOTO').subscribe({
        next:(data:any) => {
          console.log(data);
        },
        error: (error) => {
          console.error("Error al obtener las motos:", error);
        }
      });*/

    }else if(cotizacion.tipo=="CAMION")
    {


         const camion=marca+''+version;
      this.s_ma.obtenerVehiculos(camion,anio,'CAMION').subscribe({
        next: (data: any) => {
          console.log(data.datos);

          if(cotizacion.vehiculo){
            cotizacion.vehiculo.infoauto= data.datos[0].codigo;
          }

          /*
          this.s_ma.cotizar(cotizacion).subscribe({
            next: (response) => {
              console.log("✅ Respuesta de la API MA camion:");

              const mercantilCotizado:MercantilCotizado=response;

              console.log(mercantilCotizado);

            },
            error: (error) => {
              console.error("Mercantil Andina Cotizacion Error:",
              error.error?.message || "Error desconocido");
            }
          });*/

        },
        error: (error) => console.error("Error al obtener las marcas:", error.error),
      });




    }
    else{



      this.s_ma.obtenerMarcas().subscribe({
        next: (data: any) => {
          // Excluimos las primeras 11 marcas sugeridas
          const marcasFiltradas = data.slice(11);

          marcasFiltradas.push({ desc: "VOLKSWAGEN", codigo: 46 });
          console.log(marcasFiltradas);

        const marcaEncontrada = marcasFiltradas.find(
          (m: any) => m.desc.toLowerCase() === marca.toLowerCase());

        if (marcaEncontrada)
        {

          const marcaNumber= Number(marcaEncontrada.codigo);

          console.log('marca numero '+ marcaNumber);

          this.s_ma.obtenerModelos(marcaNumber,anio).subscribe({
            next: (data) => {
              console.log(data);
              const modeloEncontrado = data.find(
                (m: any) => m.toLowerCase() === modelo.toLowerCase());

            this.s_ma.obtenerVehiculosPorModelo(marcaNumber,anio,modeloEncontrado).subscribe({
                  next: (data) => {


                  const versionEncontrada = data.find(
                  (m: any) => m.desc.toLowerCase() === version.toLowerCase());

                  if(versionEncontrada)
                  {
                    if(cotizacion.vehiculo)
                    cotizacion.vehiculo.infoauto=versionEncontrada.codigo;

                    this.s_ma.cotizar(cotizacion).subscribe({
                      next: (response) => {
                        console.log("✅ Respuesta de la API:");

                        const mercantilCotizado:MercantilCotizado=response;

                        console.log(mercantilCotizado);

                      },
                      error: (error) => {
                        console.error("Mercantil Andina Cotizacion Error:",
                        error.error?.message || "Error desconocido");
                      }
                    });

                  }
                  },
                  error: (error) => {
                    console.error("Error al obtener las versiones:", error);
                  }
                });
            },
            error: (error) => {
              console.error("Error al obtener los modelos:", error);
            }
          });
        }

        },
        error: (error) => console.error("Error al obtener las marcas:", error),
      });



    }



  }

  cotizarMercantil()
  {

    const formValues = this.cotizacionForm.value;

    const CODIGO_TIPO_INTERES = formValues.codigoTipoInteres;
    const TIPO_VEHICULO = this.getTipo(formValues.tipoVehiculo);
    const MARCA = formValues.marca.descripcion;
    const ANIO = Number(formValues.anio);
    const MODELO = formValues.modelo.descripcion;
    const VERSION = formValues.version.descripcion;
    const USO = formValues.uso;
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
      tipo: TIPO_VEHICULO,
   //   comision: nose,
   //   bonificacion: nose,
   //    ajuste_suma?:number;  //10,25,50
      desglose:true     //desglose de montos totales y cuotas
    };

    if(cotizacionData.tipo=="MOTOVEHICULO"){
      console.log('entramo');
      const MOTOVEHICULO:CotizacionVehiculoMoto=  {
        infoauto: 0,
        aniofab: ANIO,
        uso: 1,   //por ahora solo particular
        gnc: this.gnc,
        rastreo: 0 };
       cotizacionData.vehiculo=MOTOVEHICULO;
       cotizacionData.canal=81;

    }else
    {
      const VEHICULO:CotizacionVehiculo=  {
        infoauto: 0,
        anio: ANIO,
        uso: 1,   //por ahora solo particular
        gnc: this.gnc,
        rastreo: 0 };
        cotizacionData.vehiculo=VEHICULO;
    }

    console.log(cotizacionData);

   this.obtenerCotizacionMercantil(cotizacionData,MARCA,MODELO,ANIO,VERSION);

  }

  cotizar()
  {
   // this.cotizarRUS();

    this.cotizarMercantil();
  }



}
