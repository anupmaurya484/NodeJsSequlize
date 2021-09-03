import baseEditForm from "formiojs/components/_classes/component/Component.form";
export default (...extend) => {

  console.log(localStorage.getItem('EXTSOU'));
  const collection_source = JSON.parse(localStorage.getItem('EXTSOU'))
  let values = [], CollectionVar = [], InputVar = [], data_table_header = [];
  console.log(collection_source);
  if (collection_source) {
    values = collection_source.map(x => ({ "label": x.var, "value": x.var, "type": x.type }));
    CollectionVar = values.filter(x => x.type == "Collection");
    InputVar = values.filter(x => x.type == "Input Variable");
  }

  function wait(ms) {
    var start = new Date().getTime();
    var end = start;
    while (end < start + ms) {
      end = new Date().getTime();
    }
  }


  return baseEditForm(
    [
      {
        key: "display",
        components: [{
          key: "labelPosition",
          ignore: true
        }, {
          key: "label",
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
        },
        {
          // You can ignore existing fields.
          key: "description",
          ignore: true
        },
        {
          "key": "table_title",
          "type": 'textfield',
          "weight": 15,
          "label": 'Table Title',
          "defaultValue": "Table Title",
          "ignore": false
        },
        {
          "weight": 16,
          "input": true,
          "label": 'Table Source',
          "key": "table_source",
          "type": "select",
          "data": {
            "values": [
              { "label": 'Variable', "value": 'Variable' },
              { "label": 'JSON', "value": 'JSON' }
            ]
          },
          calculateValue: function customDefaultValue(context) {
            if (context.data.table_source == "JSON") {
              context.data.collection_lista_variable = "";
            }
            console.log("==========sds============");
            context.data.is_selected_collections = false
            debugger
            return context.data.table_source;

          },
        },
        {
          "weight": 17,
          "input": true,
          "label": 'Select Collection Variable',
          "key": "collection_lista_variable",
          "type": "select",
          "data": {
            "values": CollectionVar
          },
          "conditional": {
            json: { '===': [{ var: 'data.table_source' }, 'Variable'] },
          },
          calculateValue: function customDefaultValue(context) {
            console.log("=========sds====");
            if (context.data.collection_lista_variable && context.data.collection_lista_variable != "") {
              if (context.data.selected_collections != context.data.collection_lista_variable) {
                
                context.data.selected_collections = context.data.collection_lista_variable;
                // await setTimeout(async function () { }, 3000, fn, par);
                console.log(context.data.data_table_header);
                wait(1000);  //7 seconds in milliseconds
                context.data.is_selected_collections = true;
                console.log('after');
                console.log(context.data.is_selected_collections);
                return context.data.collection_lista_variable;
              } else {
                return context.data.collection_lista_variable;
              }
            } else {
              return context.data.collection_lista_variable;
            }
            // return context.data.collection_lista_variable;
          }
        },
        {
          type: 'datagrid',
          input: true,
          label: 'Data Table Header',
          key: 'data_table_header',
          weight: 17,
          reorder: true,
          customDefaultValue: function customDefaultValue(context) {
            let results = []
            if (collection_source) {
              let values = collection_source.find(x => (x.var == context.data.collection_lista_variable));
              if (values.options && JSON.parse(values.options)) {
                let options = JSON.parse(values.options);
                console.log(options.columns);
                results = options.columns.map((x) => ({ "label": x.text, "value": x.dataField }));
              }
            }
            console.log(results);
            return results;
          },
          components: [{
            label: 'Label',
            key: 'label',
            input: true,
            type: 'textfield',
          },
          {
            label: 'Value',
            key: 'value',
            input: true,
            type: 'textfield',
            allowCalculateOverride: true,
            calculateValue: { _camelCase: [{ var: 'row.label' }] },
          },
          ],
          "conditional": {
            json: { '===': [{ var: 'data.is_selected_collections' }, true] },
          }
        },

          // {
          //   type: 'textarea',
          //   as: 'json',
          //   editor: 'ace',
          //   weight: 16,
          //   input: true,
          //   key: 'setup',
          //   inputType: 'dataTableCustomComp',
          //   label: 'Data Table Setup',
          //   tooltip: 'Please refer to documentation at https://react-bootstrap-table.github.io/react-bootstrap-table2/',
          //   defaultValue: {
          //     columns: [
          //       {
          //         dataField: 'id',
          //         text: 'Product ID',
          //         sort: true
          //       }, {
          //         dataField: 'name',
          //         text: 'Product Name',
          //         sort: true
          //       }, {
          //         dataField: 'price',
          //         text: 'Product Price',
          //         sort: true
          //       }
          //     ],
          //     defaultSorted: []
          //   }
          // }, {
          //   type: 'checkbox',
          //   input: true,
          //   inputType: 'checkbox',
          //   key: 'enableActionRow',
          //   label: 'Enable Action Row',
          //   weight: 116,
          //   tooltip: 'When the button is pressed, show any validation errors on the form.',
          // }, {
          //   type: 'textfield',
          //   weight: 117,
          //   input: true,
          //   key: 'actionRow',
          //   label: 'Action Name',
          //   tooltip: 'Please refer to documentation at https://react-bootstrap-table.github.io/react-bootstrap-table2/',
          //   conditional: {
          //     json: { '===': [{ var: 'data.enableActionRow' }, true] },
          //   },
          // }, {
          //   type: 'checkbox',
          //   input: true,
          //   inputType: 'checkbox',
          //   key: 'enableActionCol',
          //   label: 'Enable Action column',
          //   weight: 118,
          //   tooltip: 'When the button is pressed, show any validation errors on the form.',
          // },
          // {
          //   type: 'textarea',
          //   as: 'json',
          //   editor: 'ace',
          //   weight: 121,
          //   input: true,
          //   key: 'actionSetup',
          //   inputType: 'textareacomp',
          //   tooltip: 'Please refer to documentation at https://react-bootstrap-table.github.io/react-bootstrap-table2/',
          //   defaultValue: {
          //     "actions": [{
          //       "title": "Open",
          //       "actionName": "ManualAction1",
          //       "class": "text-success",
          //       "icon": "visibility",
          //       "index": 1
          //     },
          //     {
          //       "title": "Edit",
          //       "actionName": "",
          //       "class": "text-warning",
          //       "icon": "edit",
          //       "index": 2
          //     },
          //     {
          //       "title": "Delete",
          //       "actionName": "",
          //       "class": "text-danger",
          //       "icon": "delete",
          //       "index": 3
          //     }]
          //   },
          //   conditional: {
          //     json: { '===': [{ var: 'data.enableActionCol' }, true] },
          //   },
          // },
        ]
      },
      {
        key: "data",
        components: [{
          // Or add your own. The syntax is form.io component definitions.
          type: "textarea",
          as: 'json',
          editor: 'ace',
          input: true,
          label: "Default Value",
          rows: 10,
          weight: 12,
          key: "value",
          defaultValue: {
            rows: [
              // {id:"1", name:"Produc 1", price: "12.3"},
              // {id:"2", name:"Produc 2", price: "22.3"}
            ]
          }
        }]
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