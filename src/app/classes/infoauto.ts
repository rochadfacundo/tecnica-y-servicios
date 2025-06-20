// Clase base con las propiedades comunes
export class EntityBase {
  list_price: boolean=false;
  prices: boolean=false;
  prices_from: number=0;
  prices_to: number=0;
  summary: string='';

  constructor(data: Partial<EntityBase>) {
    Object.assign(this, data);
  }
}

// Marca
export class Brand extends EntityBase {
  id: number=0;
  name: string='';
  logo_url: string='';

  constructor(data: Partial<Brand>) {
    super(data);
    Object.assign(this, data);
  }
}

// Grupo dentro de una marca
export class Group extends EntityBase {
  id: number=0;
  brand_id: number=0;
  name: string='';
  constructor(data: Partial<Group>) {
    super(data);
    Object.assign(this, data);
  }
}

// Modelo de un vehículo
export class Model extends EntityBase {
  brand_id: number=0;
  group_id: number=0;
  codia: number=0;
  as_codia: number=0;
  r_codia: number=0;
  description: string='';
  photo_url: string='';
  position: number=0;

  constructor(data: Partial<Model>) {
    super(data);
    Object.assign(this, data);
  }
}

// Precio usado
export class Price {
  codia: number=0;
  year: number=0;
  price: number=0;

  constructor(data: Partial<Price>) {
    Object.assign(this, data);
  }
}

// Precio 0km
export class ListPrice {
  codia: number=0;
  list_price: number=0;

  constructor(data: Partial<ListPrice>) {
    Object.assign(this, data);
  }
}

// Característica técnica
export class Feature {
  id: number=0;
  category_name: string='';
  description: string='';
  type: string='';
  position: number=0;
  length: number=0;
  decimals: number=0;

  constructor(data: Partial<Feature>) {
    Object.assign(this, data);
  }
}

// Opciones de características técnicas
export class Choice {
  id: number=0;
  feature_id: number=0;
  description: string='';
  long_description: string='';

  constructor(data: Partial<Choice>) {
    Object.assign(this, data);
  }
}

// Fotos
export class Photo {
  codia: number=0;
  url: string='';

  constructor(data: Partial<Photo>) {
    Object.assign(this, data);
  }
}
