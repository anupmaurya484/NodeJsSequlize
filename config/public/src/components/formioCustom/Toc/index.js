import React, { Component } from "react";
import { connect } from 'react-redux';
import ReactDOM from "react-dom";
import { ReactComponent } from "react-formio";
import settingsForm from "./FormioCard.settingsForm";
import { getObjectKey } from '../../../utils/helperFunctions'
const headerStyle = {
    "textAlign": "center",
    "padding": "10px",
    "marginBottom": "0",
    "backgroundColor": "#f6f6f6",
    "borderBottom": "0 solid #f6f6f6"
}
const headerCard = {
    "height": "90vh",
    "position": "fixed",
    "top": "58px",
    "width": "16%"
}
const TocCustomComp = class extends Component {
    constructor(props) {
        super(props);
        this.state = {
            component: props.component,
            is_show_success: false,
            submission: { isNew: true, data: {} },
            formOptions: { readOnly: true },
            isCollection: true,
            tocLists: [],
            collectionId: 0,
            notConntent: 0,
            collectionformsId: "",
            formType: false,
            isPublicPage: false,
            collectionName: "",
            formschema: "",
            createdActionAPI: "",
            collectionID: null,
            formLanguage: null,
            formOptions: { readOnly: false },
            is_refersh_form: false,
            toc_source: ""

        };
    }

    componentDidMount = async () => {
        const props = this.props;
        try {
            const that = this;
            if (props.component.toc_source == "JSON" && props.component.topics) {
                this.setState({ tocLists: props.component.topics.topics, toc_source: props.component.toc_source })
            } else if (props.value && props.component.toc_source == "Variable" && props.value.length != 0) {
                let tocLists = [];
                props.value.forEach((element, i) => {
                    element["documentId"] = element._id;
                    let link = props.component.enableInputTopicLink ? props.component.input_link : element[props.component.link]
                    tocLists.push({
                        "_id": element._id,
                        "topic": element[props.component.topic] || ("Topic" + i + 1),
                        "link": that.getHrefValue(link, props.component.enableInputTopicLink, element)
                    });
                });

                this.setState({ tocLists: tocLists, toc_source: props.component.toc_source });
                this.setState({ is_refersh_form: true })
            }
        } catch (err) {
            console.log(err);
            this.setState({ notConntent: 0 });
        }
    }

    getHrefValue = (link, enableInputTopicLink, object) => {
        let value = link;
        if (enableInputTopicLink) {
            var gv = [], s;
            const regex = /\{{([0-9a-zA-Z-_., \/\']+)\}}/gm;
            while ((s = regex.exec(value)) !== null) {
                if (s.index === regex.lastIndex) {
                    regex.lastIndex++;
                }
                gv.push(s[0]);
            }
            for (let index = 0; index < gv.length; index++) {
                const key = getObjectKey(gv[index], 0);
                if ("pathname" == key) {
                    value = value.replace(gv[index], window.location.href.split("?")[0]);
                } else {
                    const objectKey = getObjectKey(gv[index], 1);
                    value = value.replace(gv[index], object[objectKey]);
                }
            }
        }
        return value;
    }


    render() {

        const { tocLists } = this.state;
        if (!tocLists) return false;

        return (
            <div className="toc-heading" style={{ "height": "100vh" }}>
                <h3 style={{ "textAlign": "center", "padding": "10px", "marginBottom": "0px", "backgroundColor": "rgb(246, 246, 246)", "borderBottom": "0px solid rgb(246, 246, 246)" }}>{this.props.component.toc_title}</h3>
                {tocLists.length != 0 &&
                    <ul className="border" style={{ "height": "98vh" }}>
                        {tocLists.map((x, i) =>
                            <li key={i} class="toc-item toc-h1"><a href={x.link}><span>{i + 1}.</span> &nbsp;&nbsp;&nbsp;{x.topic}</a></li>
                        )}
                    </ul>
                }
            </div>
        );
    }
};

export default class TocCustom extends ReactComponent {
    /**
   * This function tells the form builder about your component. It's name, icon and what group it should be in.
   *
   * @returns {{title: string, icon: string, group: string, documentation: string, weight: number, schema: *}}
   */
    static get builderInfo() {
        return {
            title: "Toc",
            icon: "map-signs",
            group: "Layout",
            documentation: "",
            weight: -10,
            schema: TocCustom.schema()
        };
    }

    /**
     * This function is the default settings for the component. At a minimum you want to set the type to the registered
     * type of your component (i.e. when you call Components.setComponent('type', MyComponent) these types should match.
     *
     * @param sources
     * @returns {*}
     */
    static schema() {
        return ReactComponent.schema({
            type: "tocCustomComp"
        });
    }

    /*
     * Defines the settingsForm wsettingsFormhen editing a component in the builder.
     */

    static editForm = settingsForm;

    static element = "";
    setValue(value) {
        this.dataValue = value
        if (this.element != "")
            this.attachReact(this.element)
    }

    updateValue = () => {
        // set value
        console.log("updateValue called", this.dataForSetting, this.dataValue)
    };

    /**
     * This function is called when the DIV has been rendered and added to the DOM. You can now instantiate the react component.
     *
     * @param DOMElement
     * #returns ReactInstance
     */
    attachReact(element) {
        this.element = element

        if (this.dataValue || this.component.toc_source == "JSON") {
            ReactDOM.render(
                <TocCustomComp
                    component={this.component} // These are the component settings if you want to use them to render the component.
                    value={this.dataValue} // The starting value of the component.
                    onChange={this.updateValue} // The onChange event to call when the value changes.
                />,
                element);
        } else {
            ReactDOM.render(
                <div className="toc-heading">
                    <h3 style={{ "textAlign": "center", "padding": "10px", "marginBottom": "0px", "backgroundColor": "rgb(246, 246, 246)", "borderBottom": "0px solid rgb(246, 246, 246)" }}>{this.component.toc_title}</h3>
                </div>
                , element);

        }

    }

    /**
     * Automatically detach any react components.
     *
     * @param element
     */
    detachReact(element) {
        if (element) {
            this.element = element
            ReactDOM.unmountComponentAtNode(element);
        }
    }
}