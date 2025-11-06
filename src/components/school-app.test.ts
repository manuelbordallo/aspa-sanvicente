import { expect } from '@esm-bundle/chai';
import { fixture, html } from '@open-wc/testing';
import './school-app';
import { SchoolApp } from './school-app';

describe('SchoolApp', () => {
  it('should render the app title', async () => {
    const el = await fixture<SchoolApp>(html`<school-app></school-app>`);
    const title = el.shadowRoot?.querySelector('h1');
    expect(title?.textContent?.trim()).to.equal('Gestión Escolar');
  });

  it('should show welcome message', async () => {
    const el = await fixture<SchoolApp>(html`<school-app></school-app>`);
    const welcomeText = el.shadowRoot?.querySelector('h2');
    expect(welcomeText?.textContent?.trim()).to.equal('Bienvenido');
  });
});
