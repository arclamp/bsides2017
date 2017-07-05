import VisComponent from 'candela/VisComponent';

export default class Table extends VisComponent {
  constructor(el, options) {
    super(el, options);

    console.log('Table.constructor()');
  }

  render () {
    console.log('Table.render()')
  }
}
