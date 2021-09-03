import baseEditForm from "formiojs/components/_classes/component/Component.form";

export default (...extend) => {
  return baseEditForm(
    [
      {
        key: "display",
        components: [{
          key: "labelPosition",
          ignore: true
        },{
          key: "label",
          ignore: true
        },{
          key: "description",
          ignore: true
        },{
          key: "tooltip",
          ignore: true
        },{
          key: "tabIndex",
          ignore: true
        },{
          key: "labelWidth",
          ignore: true
        },{
          key: "labelMargin",
          ignore: true
        },{
          // You can ignore existing fields.
          key: "placeholder",
          ignore: true
        },{
          type: 'textarea',
          as: 'html',
          editor: 'ckeditor',
          weight: 16,
          input: true,
          key: 'header',
          label: 'header',
          tooltip: 'Please refer to documentation at https://react-bootstrap-table.github.io/react-bootstrap-table2/',
          defaultValue: ''
        }]
      },
      {
        key: "data",
        components: [],
        ignore: true
      },
      {
        key: "validation",
        components: [],
        ignore: true
      },
      {
        key: "api",
        components: [],
        ignore: true
      },
      {
        key: "conditional",
        components: [],
        ignore: true
      },
      {
        key: "logic",
        components: [],
        ignore: true
      }
    ],
    ...extend
  );
};