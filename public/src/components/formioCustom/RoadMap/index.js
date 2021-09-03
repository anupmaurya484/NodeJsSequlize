import React, { Component,useState } from "react";
import ReactDOM from "react-dom";
import { ReactComponent } from "react-formio";
import ScrollMenu from "react-horizontal-scrolling-menu";
import settingsForm from "./FormioRoadMap.settingsForm";

// list of items
const list = [
    { name: '2020', desc: ['Complete Yield Optimizer', 'User Interface', 'Alpha Protocol release', '1. Audit'] },
    { name: 'Q1 2021', desc: ['Release of staking contracts', 'Alpha launch', 'Launch of "Pools" ETH and BTC ', 'Audit by Cretik(Pending)', 'TGE'] },
    { name: 'Q2 2021', desc: ['Mainnet launch', 'Protocol additions', 'Moonbeam collaboration & polkadot integration move'] },
    { name: 'Q3 2021', desc: ['Implementation of insurance', 'Credit delegation integration', 'Risk adijusted optimization'] },
    { name: 'Q4 2021', desc: ['Batch investing', 'TBA'] },

];


const MenuItem = ({ text, selected, desc }) => {
    return (
        <div className={`timeline-article timeline-article-top menu-item ${selected ? 'active' : ''}`}>
            <div className="content-date">
                <span>{text}</span>
            </div>
            <div className="meta-date"></div>
            <div className="content-box">
                <div>
                    {desc.map((x, i) => <div key={i}>{x}</div>)}
                </div>
            </div>
        </div>

    );
};

const Menu = (list, selected) => {
    return list.map(el => {
        const { name, desc } = el;
        return (<MenuItem text={name} key={name} selected={selected} desc={desc} />);
    });
}


const menu = Menu(list, 'item1')

const RoadmapCustomComp = () => {

    const [selected, setSelected] = useState('item1');
    const Arrow = ({ text, className }) => (<div className={className} >{text}</div>);

    return (
        <div className="container">
            <div className="token-box">
                <div className="heading-box w-100">
                    <div className="heading">Road Map</div>
                </div>
                
                <div className="token-list-outer">
                    <div className="row">
                        <div className="col-md-12 col-sm-12 col-xs-12">
                            <section className="main-timeline-section">
                                <div className="timeline-start"></div>
                                <div className="conference-center-line"></div>
                                <div className="conference-timeline-content">
                                    <ScrollMenu
                                        data={menu}
                                        selected={selected}
                                        scrollBy={1}
                                        onSelect={(key) => console.log(key)}
                                    />
                                </div>
                                <div className="timeline-end"></div>
                            </section>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
};


export default class RoadmapCustom extends ReactComponent {
    /**
   * This function tells the form builder about your component. It's name, icon and what group it should be in.
   *
   * @returns {{title: string, icon: string, group: string, documentation: string, weight: number, schema: *}}
   */
    static get builderInfo() {
        return {
            title: "Roadmap",
            icon: "map-signs",
            group: "Layout",
            documentation: "",
            weight: -10,
            schema: RoadmapCustom.schema()
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
            type: "roadMapCustomComp"
        });
    }

    /*
     * Defines the settingsForm when editing a component in the builder.
     */
    static editForm = settingsForm;

    static element = "";
    setValue(value) {
        this.dataValue = value
        console.log(this.component);
        console.log(value);
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
        ReactDOM.render(
            <RoadmapCustomComp
                component={this.component} // These are the component settings if you want to use them to render the component.
                value={this.dataValue} // The starting value of the component.
                onChange={this.updateValue} // The onChange event to call when the value changes.
            />,
            element
        );
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