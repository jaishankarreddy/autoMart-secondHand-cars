import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { CatalogVehicle } from '../../../services/catalog.service';

/** Server-side filter option lists + bounds for one vehicle type. */
export interface InventoryFacets {
  type: 'car' | 'bike';
  brands: string[];
  models: string[];
  years: number[];
  fuels: string[];
  transmissions: string[];
  owners: number[];
  bodyTypes: string[];
  districts: string[];
  colors: string[];
  priceMin: number;
  priceMax: number;
  engineCcMin: number;
  engineCcMax: number;
  mileageMax: number;
  count: number;
  priceBuckets: { threshold: number | null; count: number }[];
  kmBuckets: { threshold: number; count: number }[];
}

export interface VehiclePage {
  items: CatalogVehicle[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const API_URL = '/api';

@Injectable({ providedIn: 'root' })
export class InventoryService {
  private readonly http = inject(HttpClient);

  fetchVehicles(params: URLSearchParams): Promise<VehiclePage> {
    return firstValueFrom(
      this.http.get<VehiclePage>(`${API_URL}/vehicles?${params.toString()}`)
    );
  }

  fetchFacets(type: 'car' | 'bike'): Promise<InventoryFacets> {
    return firstValueFrom(
      this.http.get<InventoryFacets>(`${API_URL}/facets?type=${type}`)
    );
  }
}