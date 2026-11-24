import { describe, expect, it } from '@jest/globals';
import { ActivityStatus } from '@prisma/client';
import { ActivityDomain } from '../domain/activity.domain';
import { InvalidStateTransitionError } from '../domain/invalid.state.transition';

function crear(status: ActivityStatus) {
  return new ActivityDomain({ id: 'a1', title: 'Actividad', status, startDate: '2030-01-01' });
}

describe('Patrón State de actividades', () => {
  describe('DRAFT', () => {
    it('puede editarse, publicarse y cancelarse', () => {
      expect(crear('DRAFT').canEdit()).toBe(true);

      const publicada = crear('DRAFT');
      publicada.publish();
      expect(publicada.status).toBe('PUBLISHED');

      const cancelada = crear('DRAFT');
      cancelada.cancel();
      expect(cancelada.status).toBe('CANCELLED');
    });

    it('no puede finalizarse', () => {
      expect(() => crear('DRAFT').finish()).toThrow(InvalidStateTransitionError);
    });
  });

  describe('PUBLISHED', () => {
    it('puede editarse, cancelarse y finalizarse', () => {
      expect(crear('PUBLISHED').canEdit()).toBe(true);

      const cancelada = crear('PUBLISHED');
      cancelada.cancel();
      expect(cancelada.status).toBe('CANCELLED');

      const finalizada = crear('PUBLISHED');
      finalizada.finish();
      expect(finalizada.status).toBe('FINISHED');
    });

    it('no puede publicarse otra vez', () => {
      expect(() => crear('PUBLISHED').publish()).toThrow(InvalidStateTransitionError);
    });
  });

  describe.each(['CANCELLED', 'FINISHED'] as ActivityStatus[])('%s', (status) => {
    it('no puede editarse', () => {
      expect(crear(status).canEdit()).toBe(false);
    });

    it('rechaza toda transición y conserva su estado', () => {
      const actividad = crear(status);
      expect(() => actividad.publish()).toThrow(InvalidStateTransitionError);
      expect(() => actividad.cancel()).toThrow(InvalidStateTransitionError);
      expect(() => actividad.finish()).toThrow(InvalidStateTransitionError);
      expect(actividad.status).toBe(status);
    });
  });
});
