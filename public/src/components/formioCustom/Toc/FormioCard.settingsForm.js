import baseEditForm from "formiojs/components/_classes/component/Component.form";

export default (...extend) => {
  console.log(localStorage.getItem('EXTSOU'));
  const page_source = JSON.parse(localStorage.getItem('EXTSOU'))
  let values = [], CollectionVar = [], InputVar = [];
  console.log(page_source);
  if (page_source) {
    values = page_source.map(x => ({ "label": x.var, "value": x.var, "type": x.type }));
    CollectionVar = values.filter(x => x.type == "Collection");
    InputVar = values.filter(x => x.type == "Input Variable");
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
        },
        {
          "key": "toc_title",
          "type": 'textfield',
          "weight": 15,
          "label": 'TOC Title',
          "defaultValue": "Toc Title",
          "ignore": false
        },
        {
          "weight": 16,
          "input": true,
          "label": 'TOC Source',
          "key": "toc_source",
          "type": "select",
          "data": {
            "values": [
              { "label": 'Variable', "value": 'Variable' },
              { "label": 'JSON', "value": 'JSON' }
            ]
          },
          calculateValue: function customDefaultValue(context) {
            console.log(context.data.toc_source);
            if (context.data.toc_source == "JSON") {
              context.data.toc_content = "";
            }
            return context.data.toc_source;
          },
        },
        {
          type: 'textarea',
          as: 'json',
          editor: 'ace',
          weight: 17,
          input: true,
          key: 'topics',
          label: 'TOC JSON Editor',
          tooltip: 'Please refer to documentation at https://react-bootstrap-table.github.io/react-bootstrap-table2/',
          defaultValue: {
            topics: [
              { "topic": "Example1", "link": "" },
              { "topic": "Example2", "link": "" }
            ]
          },
          "conditional": {
            json: { '===': [{ var: 'data.toc_source' }, 'JSON'] },
          },
        },
        {
          "weight": 17,
          "input": true,
          "label": 'Select Collection Variable',
          "key": "toc_content",
          "type": "select",
          "data": {
            "values": CollectionVar
          },
          "conditional": {
            json: { '===': [{ var: 'data.toc_source' }, 'Variable'] },
          },
        },
        {
          "weight": 18,
          "input": true,
          "label": 'Select Topic',
          "key": "topic",
          "type": "select",
          "dataSrc": 'custom',
          "data": {
            custom: function custom(context) {
              var values = [], results = [];
              if (page_source) {
                let values = page_source.find(x => (x.var == context.data.toc_content));
                if (values.options && JSON.parse(values.options)) {
                  let options = JSON.parse(values.options);
                  results = options.columns.filter(x => x.dataField.toLocaleLowerCase() == "topic").map((x) => ({ "label": x.text, "value": x.dataField }))
                }
              }
              results.forEach(element => values.push(element));
              return values;
            }
          },
          "conditional": {
            json: { '===': [{ var: 'data.toc_source' }, 'Variable'] },
          }
        },
        {
          type: 'checkbox',
          input: true,
          inputType: 'checkbox',
          key: 'enableInputTopicLink',
          label: 'Enable Input Topic Link',
          weight: 18,
          tooltip: 'When the button is pressed, show any validation errors on the form.',
          conditional: {
            json: { '===': [{ var: 'data.toc_source' }, 'Variable'] },
          }
        },
        {
          "weight": 19,
          "input": true,
          "label": 'Select Topic Link',
          "key": "link",
          "type": "select",
          "dataSrc": 'custom',
          "data": {
            custom: function custom(context) {
              var values = [], results = [];
              if (page_source) {
                let values = page_source.find(x => (x.var == context.data.toc_content));
                if (values.options && JSON.parse(values.options)) {
                  let options = JSON.parse(values.options);
                  console.log(options.columns);
                  results = options.columns.filter(x => (x.dataField.toLocaleLowerCase() == "topiclink")).map((x) => ({ "label": x.text, "value": x.dataField }))
                }
              }
              results.forEach(element => values.push(element));
              console.log(values);
              return values;
            }
          },
          "conditional": {
            json: { '==': [{ var: 'data.enableInputTopicLink' }, false] }
          }
        },
        {
          "key": "input_link",
          "type": 'textfield',
          "weight": 21,
          "label": 'Input Topic Link',
          "ignore": false,
          customDefaultValue: function customDefaultValue(context) {
            return "{{pathname}}?id={{" + context.data.toc_content + "Item.documentId}}";
          },
          "conditional": {
            json: { '==': [{ var: 'data.enableInputTopicLink' }, true] },
          }
        },
        {
          type: 'textarea',
          as: 'json',
          editor: 'ace',
          weight: 23,
          key: 'viewItem',
          class: "readOnly",
          label: 'Collection Item Variables Details',
          disable: true,
          tooltip: 'Please refer to documentation at https://react-bootstrap-table.github.io/react-bootstrap-table2/',
          "conditional": {
            json: { '!=': [{ var: 'data.toc_content' }, ''] },
          },
          customDefaultValue: function customDefaultValue(context) {
            var results = {};
            if (page_source) {
              let values = page_source.find(x => (x.var == context.data.toc_content));
              console.log(values);
              if (values.options && JSON.parse(values.options)) {
                let options = JSON.parse(values.options);
                options.columns.map(x => results[x.dataField] = `{{${context.data.toc_content + "Item." + x.dataField}}}`)
              }
            }
            return results
          },
        },

        {
          type: 'textarea',
          as: 'json',
          editor: 'ace',
          weight: 24,
          key: 'globalItem',
          class: "readOnly",
          label: 'Global Variables Details',
          customDefaultValue: function customDefaultValue(context) {
            var results = {
              'pathname': '{{pathname}}   /* System Location Origin*/',
            };
            return results
          },
          "conditional": {
            json: { '===': [{ var: 'data.toc_source' }, 'Variable'] },
          }
        },

          // {
          //   type: "select",
          //   label: "Favorite Things",
          //   key: "favoriteThings",
          //   placeholder: "These are a few of your favorite things...",
          //   data: {
          //     values: [
          //       {
          //         value: "raindropsOnRoses",
          //         label: "Raindrops on roses"
          //       },
          //       {
          //         value: "whiskersOnKittens",
          //         label: "Whiskers on Kittens"
          //       },
          //       {
          //         value: "brightCopperKettles",
          //         label: "Bright Copper Kettles"
          //       },
          //       {
          //         value: "warmWoolenMittens",
          //         label: "Warm Woolen Mittens"
          //       }
          //     ]
          //   },
          //   dataSrc: "values",
          //   template: "<span><input type='text' /> {{ item.label }}</span>",
          //   multiple: true,
          //   input: true
          // },

        ]
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