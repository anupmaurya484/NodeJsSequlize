import baseEditForm from "formiojs/components/_classes/component/Component.form";
import Tagify from '@yaireo/tagify'
export default (...extend) => {


  const collection_source = JSON.parse(localStorage.getItem('EXTSOU'));
  let values = [], CollectionVar = [], InputVar = [], isCallItemValue = false, setTime = null, setInt = null, onChange = false;
  if (collection_source) {
    values = collection_source.map(x => ({ "label": x.var, "value": x.var, "type": x.type }));
    CollectionVar = values.filter(x => x.type == "Collection");
    InputVar = values.filter(x => x.type == "Input Variable");
  }

  setTimeout(() => { onChange = true }, 3000)
  setInt = setInterval(() => {
    console.log("testing");
    if (document.querySelector("div .component-edit-container")) {
      document.querySelector("div .component-edit-container").querySelectorAll("div.row .col-sm-6")[3].style.display = "none";
      document.querySelector("div .component-edit-container").querySelectorAll("div.row .col-sm-6")[2].className = "col-sm-12";
      document.querySelectorAll("div .component-edit-container .row")[1].append(document.querySelector("button[ref=saveButton]"));
      document.querySelectorAll("div .component-edit-container .row")[1].append(document.querySelector("button[ref=cancelButton]"));
      document.querySelectorAll("div .component-edit-container .row")[1].append(document.querySelector("button[ref=removeButton]"));
      clearInterval(setInt)
    }
  }, 100);


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
            console.log(context.data.table_source);
            if (context.data.table_source == "JSON") {
              context.data.data_table_header = "";
              context.data.collection_lista_variable = "";
              context.data.is_selected_collections = false;
            }

            var results = {};
            if (collection_source && context.data.collection_lista_variable && !isCallItemValue) {
              isCallItemValue = true
              let values = collection_source.find(x => (x.var == context.data.collection_lista_variable));
              if (values.options && JSON.parse(values.options)) {
                let options = JSON.parse(values.options);
                context.data.connId = values.connId;
                console.log(context.data.connId);
                context.data.whitelist = [];
                options.columns.map(x => {
                  results[x.dataField] = `{{${context.data.collection_lista_variable + "Item." + x.dataField}}}`
                  context.data.whitelist.push({ value: results[x.dataField], title: results[x.dataField] })
                });
              }
              context.data.viewItem = results;
            }

            if (context.data.collection_lista_variable && context.data.collection_lista_variable != "") {
              context.data.is_selected_collections = true;
            }

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
          calculateValue: function calculateValue(context) {
            return context.data.collection_lista_variable
          },
          onChange(context) {
            if (onChange) {
              let table_th = context.data.table_th;
              context.instance.root.getComponent('table_th').setValue([{ label: '', value: '' }]);
              var results = {}, table_th_values = [];
              if (collection_source) {
                let values = collection_source.find(x => (x.var == context.data.collection_lista_variable));
                context.data.whitelist = [];
                if (values.options && JSON.parse(values.options)) {
                  let options = JSON.parse(values.options);
                  context.data.connId = values.connId;
                  options.columns.map(x => {
                    results[x.dataField] = `{{${context.data.collection_lista_variable + "Item." + x.dataField}}}`
                    context.data.whitelist.push({ value: results[x.dataField], title: results[x.dataField] });
                    table_th_values.push({ label: x.text, value: JSON.stringify([[{ "value": results[x.dataField], title: + x.text, prefix: "@" }]]) })
                  });
                }
              }
              setTimeout(() => {
                context.data.table_th = table_th_values
                context.instance.root.getComponent('table_th').setValue(table_th_values)
              }, 100)
            }
          },
          "conditional": {
            json: { '===': [{ var: 'data.table_source' }, 'Variable'] },
          },
        },
        {
          type: 'datagrid',
          input: true,
          label: 'Data Table Header',
          key: 'table_th',
          weight: 17,
          reorder: true,
          defaultValue: [{ label: '', value: '' }],
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
            type: 'textfield'
          },
          ],
          "conditional": {
            json: { '===': [{ var: 'data.is_selected_collections' }, true] },
          },

          calculateValue: function calculateValue(context) {
            const callTogify = () => {
              setTime = setTimeout(() => {
                const selected = document.querySelectorAll("td .formio-component-value input");
                if (selected && selected.length != 0) {
                  selected.forEach((input, index) => {
                    new Tagify(input, {
                      whitelist: context.data.whitelist,
                      mode: 'mix',  // <--  Enable mixed-content
                      tagTextProp: 'title',  // <-- the default property (from whitelist item) for the text to be rendered in a tag element.
                      pattern: /@/,  // <--  Text starting with @ or # (if single, String can be used here)
                      dropdown: {
                        maxItems: context.data.whitelist.length,           // <- mixumum allowed rendered suggestions
                        classname: "tags-look", // <- custom classname for this dropdown, so it could be targeted
                        enabled: 0,             // <- show suggestions on focus
                        closeOnSelect: true    // <- do not hide the suggestions dropdown once an item has been selected
                      }
                    })
                    input.addEventListener('change', (e) => {
                      context.data.table_th[Number(e.target.name.replace(/[^\d.-]/g, ''))].value = e.target.value
                    });
                    console.log("clear set time out");
                    clearTimeout(setTime)
                  })
                } else {
                  callTogify();
                }
              }, 300)
            }

            callTogify();
            return context.data.table_th
          }
        },

        {
          type: 'textarea',
          as: 'json',
          editor: 'ace',
          weight: 17,
          input: true,
          key: 'json_config',
          label: 'DataTable JSON Config',
          tooltip: 'Please refer to documentation at https://react-bootstrap-table.github.io/react-bootstrap-table2/',
          defaultValue:
          {
            'processing': true,
            'serverSide': true,
            'serverMethod': 'post',
            'ajax': {
              'url': 'https://makitweb.com/demos/datatable_ajax/ajaxfile.php',
            },
            'columns': [
              { "data": 'emp_name' },
              { "data": 'email' },
              { "data": 'gender' },
              { "data": 'salary' },
              { "data": 'city' },
            ]
          },
          "conditional": {
            json: { '===': [{ var: 'data.table_source' }, 'JSON'] },
          },
        },
        {
          type: 'checkbox',
          input: true,
          inputType: 'checkbox',
          key: 'enableDataTableConfig',
          label: 'Enable DataTable Config',
          weight: 18,
          tooltip: 'When the button is pressed, show any validation errors on the form.',
        },
        {
          type: 'textarea',
          as: 'json',
          editor: 'ace',
          weight: 19,
          input: true,
          key: 'json_datatable_config',
          label: 'DataTable JSON Config',
          tooltip: 'Please refer to documentation at https://react-bootstrap-table.github.io/react-bootstrap-table2/',
          defaultValue:
          {
            "order": [[0, 'asc']],
            "paging": true,
            "pageLength": 10,
            "processing": true,
            "serverSide": true
          },
          "conditional": {
            json: { '===': [{ var: 'data.enableDataTableConfig' }, true] },
          },
        },
        {
          type: 'checkbox',
          input: true,
          inputType: 'checkbox',
          key: 'enableActionRow',
          label: 'Enable Action Row',
          weight: 20,
          tooltip: 'When the button is pressed, show any validation errors on the form.',
        },
        {
          type: 'textfield',
          weight: 21,
          input: true,
          key: 'actionRow',
          label: 'Action Name',
          tooltip: 'Please refer to documentation at https://react-bootstrap-table.github.io/react-bootstrap-table2/',
          conditional: {
            json: { '===': [{ var: 'data.enableActionRow' }, true] },
          },
        },
        {
          type: 'checkbox',
          input: true,
          inputType: 'checkbox',
          key: 'enableActionCol',
          label: 'Enable Action column',
          weight: 22,
          tooltip: 'When the button is pressed, show any validation errors on the form.',
        },
        {
          type: 'datagrid',
          input: true,
          label: 'DataTable Action setup',
          key: 'action_column_lists',
          weight: 23,
          reorder: true,
          defaultValue: [{ label: '', value: '' }],
          components: [{
            label: 'title',
            key: 'label',
            input: true,
            type: 'textfield',
          }, {
            label: 'actionName',
            key: 'actionName',
            input: true,
            type: 'textfield'
          },
          {
            label: 'icon Name',
            key: 'iconName',
            input: true,
            type: 'textfield'
          },
          {
            label: 'class name',
            key: 'className',
            input: true,
            type: 'textfield'
          },
          ],
          "conditional": {
            json: { '===': [{ var: 'data.enableActionCol' }, true] },
          }
        }
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