import { TipoVehiculoRUS } from "../../../interfaces/cotizacionRioUruguay";
import { TipoDeUso } from "../../../interfaces/tiposDeUso";

export function getTiposVehiculoRUS(tipo:string):TipoVehiculoRUS[]{

  let tiposVehiculo:TipoVehiculoRUS[]=[];

  if(tipo==='VEHICULO')
  {
    tiposVehiculo =[{ id: 1, nombre: 'AUTO' },
      { id: 2, nombre: 'PICK-UP "A"' },
      { id: 3, nombre: 'PICK-UP "B"' },
      { id: 4, nombre: 'CAMION HASTA 5 TN' },
      { id: 5, nombre: 'CAMION HASTA 10 TN' },
      { id: 6, nombre: 'CAMION MAS 10 TN' },
      { id: 25, nombre: 'MOTORHOME' },
      { id: 26, nombre: 'M3 OMNIBUS' }];

  }else if(tipo==='MOTOVEHICULO'){

    tiposVehiculo= [{ id: 7, nombre: 'MOTO MENOS 50 CC' },
      { id: 8, nombre: 'MOTO MAS 50 CC' }];
  }

  return tiposVehiculo;

}

  export function setTiposUso(id: number) {

    let tiposDeUso: TipoDeUso[]=[];

      switch (id) {
        case 1:   //auto
        case 2:   //pick-up A
        case 3:   //pick-up B
        case 7:   //Moto menos 50 CC
        case 8:   //Moto mas 50 CC
        case 25:   //MOTORHOME
          tiposDeUso=[
            {id: 1, uso: 'PARTICULAR',desc: 'PARTICULAR'},
            {id: 22, uso: 'COMERCIAL',desc: 'COMERCIAL'}
          ];

          break;
        case 4:    //CAMION HASTA 5 TN
        case 5:    //CAMION HASTA 10 TN
        case 6:    //CAMION MAS DE 10 TN
          tiposDeUso=[
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

        tiposDeUso=[
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
      return tiposDeUso;
  }
