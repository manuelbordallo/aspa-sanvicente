import { expect } from '@esm-bundle/chai';
import { fixture, html } from '@open-wc/testing';
import '../components/school-app.js';
import { SchoolApp } from '../components/school-app.js';

describe('E2E: Navigation Flow', () => {
  it('should render the main application', async () => {
    const el = await fixture<SchoolApp>(html`<school-app></school-app>`);
    expect(el).to.exist;
  });

  it('should display application title', async () => {
    const el = await fixture<SchoolApp>(html`<school-app></school-app>`);
    const title = el.shadowRoot?.querySelector('h1');

    expect(title).to.exist;
    expect(title?.textContent?.trim()).to.equal('Gestión Escolar');
  });

  it('should display welcome message', async () => {
    const el = await fixture<SchoolApp>(html`<school-app></school-app>`);
    const welcomeText = el.shadowRoot?.querySelector('h2');

    expect(welcomeText).to.exist;
    expect(welcomeText?.textContent?.trim()).to.equal('Bienvenido');
  });

  it('should have main container', async () => {
    const el = await fixture<SchoolApp>(html`<school-app></school-app>`);
    const container = el.shadowRoot?.querySelector('.container');

    expect(container).to.exist;
  });
});
