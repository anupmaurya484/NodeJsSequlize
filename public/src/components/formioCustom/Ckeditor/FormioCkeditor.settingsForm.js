import baseEditForm from "formiojs/components/_classes/component/Component.form";

export default (...extend) => {
  return baseEditForm(
    [
      {
        key: "display",
        components: [{
          key: "labelPosition",
          ignore: false
        }, {
          key: "label",
          ignore: false
        }, {
          key: "description",
          ignore: true
        }, {
          key: "tooltip",
          ignore: true
        }, {
          key: "tabIndex",
          ignore: true
        }, {
          key: "labelWidth",
          ignore: true
        }, {
          key: "labelMargin",
          ignore: true
        }, {
          // You can ignore existing fields.
          key: "placeholder",
          ignore: true
        }
        ]
      },
      {
        key: "data",
        ignore: false
      },
      {
        key: "validation",
        ignore: false
      },
      {
        key: "api",
        ignore: false
      },
      {
        key: "conditional",
        ignore: false
      },
      {
        key: "logic",
        ignore: false
      }
    ],
    ...extend
  );
};