import baseEditForm from "formiojs/components/_classes/component/Component.form";

export default (...extend) => {
  return baseEditForm(
    [
      {
        key: "display",
        components: [{
          key: "labelPosition",
          ignore: true
        }, {
          key: "label",
          ignore: false,
          validate: {
            pattern: '(\\w|\\w[\\w-.]*\\w)',
            patternMessage: 'The property name must only contain alphanumeric characters, underscores, dots and dashes and should not be ended by dash or dot.',
            required: true
          }
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
          type: 'textfield',
          label: 'Image Width',
          key: 'width',
          input: true,
          weight: 20,
          defaultValue: '150'
        },
        {
          type: 'textfield',
          label: 'Image height',
          key: 'height',
          input: true,
          weight: 22,
          defaultValue: '150'
        },
        {
          type: 'file',
          label: 'Upload Image ',
          key: 'upload_image',
          storage: "base64",
          imageSize: '200',
          filePattern: '*',
          fileMinSize: '0KB',
          fileMaxSize: '10MB',
          uploadOnly: false,
          image: true,
          input: true,
          weight: 23,
          defaultValue: '',
          required: true,
          validate: {
            required: true
          }
        }
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