import Component from '../lib/Components';
import Elements from '../lib/elements';

class LoginComponent extends Component {
  constructor() {
    // super omdat we overerven en anders een error krijgen
    super({
      name: 'Login',
      model: {},
    });
  }

  // eslint-disable-next-line class-methods-use-this
  render(): HTMLElement {
    const loginContainer = document.createElement('div');
    loginContainer.innerHTML = `
    `
    return loginContainer;
  }
}

export default LoginComponent;
