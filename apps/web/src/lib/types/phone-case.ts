// types/phoneCase.ts

export interface PhoneCaseModel {
    id: string;
    name: string;
    year: number;
    price: number;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface PhoneCaseMaterial {
    id: string;
    name: string;
    description: string;
    price: number;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface PhoneCaseColor {
    id: string;
    name: string;
    hex: string;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface PhoneCase {
    id: string;
    price: number;
    totalPrice: number;
    image: string;
    width: number;
    height: number;
    croppedImage: string;
    userId: string | null;
    modelId: string;
    materialId: string;
    colorId: string;
    createdAt: string;
    updatedAt: string;
    model: PhoneCaseModel;
    material: PhoneCaseMaterial;
    color: PhoneCaseColor;
  }
  