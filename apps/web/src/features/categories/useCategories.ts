import { useEffect, useState } from 'react';
import { apiGet } from '../../shared/http/client';
import type { Category } from './category';

// Centraliza traer + ordenar las categorías: antes cada formulario que
// necesitaba un <select> de categorías repetía este mismo fetch+sort.
export function useCategories(): Category[] {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    apiGet<Category[]>('/categories')
      .then((result) =>
        setCategories([...result].sort((a, b) => a.name.localeCompare(b.name, 'es'))),
      )
      .catch((err: unknown) => console.error('No se pudieron cargar las categorías:', err));
  }, []);

  return categories;
}
