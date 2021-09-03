import baseEditForm from "formiojs/components/_classes/component/Component.form";

export default (...extend) => {
  return baseEditForm(
    [
      {
        key: "display",
        components: [{
            key: "label",
            ignore: true
        },{
          // You can ignore existing fields.
          key: "placeholder",
          ignore: true
        }, {
          // Or add your own. The syntax is form.io component definitions.
          type: "select",
          input: true,
          label: "Color",
          weight: 12,
          key: "colorCode", // This will be available as component.myCustomSetting,
          template: '<span>{{ item.label }}</span>',
          dataSrc: 'values',
          data: {
            values: [{
              label: 'Primary',
              value: 'primary-color'
            }, {
              label: 'Success',
              value: 'success-color'
            }, {
              label: 'Danger',
              value: 'danger-color'
            }, {
              label: 'Warning',
              value: 'warning-color'
            }, {
              label: 'Info',
              value: 'info-color'
            }]
          }
        }
        ]
      },
      {
        key: "data",
        components: []
      },
      {
        key: "validation",
        components: []
      },
      {
        key: "api",
        components: []
      },
      {
        key: "conditional",
        components: []
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