describe('compare i18n', () => {
  beforeEach(() => {
    jest.resetModules();
    window.history.replaceState({}, '', '/compare');
    document.documentElement.lang = 'en-US';
  });

  test('uses es-419 from the query parameter', () => {
    window.history.replaceState({}, '', '/compare?lang=es-419');

    jest.isolateModules(() => {
      const i18nModule = require('../i18n');
      expect(i18nModule.resolveLanguage()).toBe('es-419');
      expect(i18nModule.t('compare.title.compare')).toBe('Comparar');
    });
  });

  test('falls back to document language when the query is missing', () => {
    document.documentElement.lang = 'es-MX';

    jest.isolateModules(() => {
      const i18nModule = require('../i18n');
      expect(i18nModule.resolveLanguage()).toBe('es-419');
      expect(i18nModule.t('compare.title.with')).toBe('con');
    });
  });

  test('defaults to English for unsupported language values and keeps unknown keys stable', () => {
    window.history.replaceState({}, '', '/compare?lang=fr-CA');
    document.documentElement.lang = 'fr-CA';

    jest.isolateModules(() => {
      const i18nModule = require('../i18n');
      expect(i18nModule.resolveLanguage()).toBe('en-US');
      expect(i18nModule.setLanguage('pt-BR')).toBe('en-US');
      expect(i18nModule.t('compare.showChangesAs')).toBe('Show changes as:');
      expect(i18nModule.t('nonexistent.translation.key')).toBe('nonexistent.translation.key');
    });
  });

  test('updates html lang when language changes and interpolates row aria labels', () => {
    jest.isolateModules(() => {
      const i18nModule = require('../i18n');
      expect(i18nModule.setLanguage('es-MX')).toBe('es-419');
      expect(document.documentElement.lang).toBe('es-419');
      expect(i18nModule.t('compare.chartAria.row', {item: 'Policía'})).toBe('Gráfica de comparación para Policía');
      expect(i18nModule.setLanguage('en-US')).toBe('en-US');
      expect(document.documentElement.lang).toBe('en-US');
      expect(i18nModule.t('compare.chartAria.row', {item: 'Police'})).toBe('Comparison chart for Police');
    });
  });
});
