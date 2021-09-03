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
        }, {
          type: 'textarea',
          as: 'json',
          editor: 'ace',
          weight: 16,
          input: true,
          key: 'setup',
          inputType:'dataTableCustomComp',
          label: 'Data Table Setup',
          tooltip: 'Please refer to documentation at https://react-bootstrap-table.github.io/react-bootstrap-table2/',
          defaultValue:{ 
            columns: [
            {
              dataField: 'id',
              text: 'Product ID',
              sort: true
            }, {
              dataField: 'name',
              text: 'Product Name',
              sort: true
            }, {
              dataField: 'price',
              text: 'Product Price',
              sort: true
            }
          ],
            defaultSorted: []
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