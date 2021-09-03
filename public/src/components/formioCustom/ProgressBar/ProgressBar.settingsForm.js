import baseEditForm from "formiojs/components/_classes/component/Component.form";

export default (...extend) => {
  return baseEditForm(
    [
      {
        key: "display",
        components: [{
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
          defaultValue: "primary-color",
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
        components: [
          {
            type: 'select',
            input: true,
            weight: 0,
            tooltip: 'The source to use for the select data. Values lets you provide your own values and labels. JSON lets you provide raw JSON data. URL lets you provide a URL to retrieve the JSON data from.',
            key: 'dataSrc',
            defaultValue: 'values',
            label: 'Data Source Type',
            dataSrc: 'values',
            data: {
              values: [{
                label: 'Values',
                value: 'values'
              }, {
                label: 'Raw JSON',
                value: 'json'
              }]
            }
          }, {
            type: 'textarea',
            as: 'json',
            editor: 'ace',
            weight: 10,
            input: true,
            key: 'data.json',
            label: 'Data Source Raw JSON',
            tooltip: 'A raw JSON array to use as a data source.',
            conditional: {
              json: {
                '===': [{
                  var: 'data.dataSrc'
                }, 'json']
              }
            }
          }, {
            type: 'datagrid',
            input: true,
            label: 'Data Source Values',
            key: 'data.values',
            tooltip: 'Values to use as the data source. Labels are shown in the select field. Values are the corresponding values saved with the submission.',
            weight: 10,
            reorder: true,
            defaultValue: [{
              label: '',
              value: ''
            }],
            components: [{
              label: 'Label',
              key: 'label',
              input: true,
              type: 'textfield'
            }, {
              label: 'Value',
              key: 'value',
              input: true,
              type: 'textfield',
              allowCalculateOverride: true,
              calculateValue: {
                _camelCase: [{
                  var: 'row.label'
                }]
              }
            }],
            conditional: {
              json: {
                '===': [{
                  var: 'data.dataSrc'
                }, 'values']
              }
            }
          }
        ]
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