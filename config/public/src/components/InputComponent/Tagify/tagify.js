import Tagify from '@yaireo/tagify'
import React, { Component, useEffect, useState } from "react";


const TagifyComponent = (props) => {

    const [value, setvalue] = useState(props.value || "");
    const [whitelist, setWhitelist] = useState(props.whitelist || []);

    // Similar to componentDidMount and componentDidUpdate:
    useEffect(() => {
        console.log('[name=' + props.name + ']');
        console.log('whitelist', whitelist);
        var input = document.querySelector('[name="' + props.name + '"]')
        console.log(input);
        if (input) {
            let tagify = new Tagify(input, {
                //  mixTagsInterpolator: ["{{", "}}"],
                mode: 'mix',  // <--  Enable mixed-content
                pattern: /@/,  // <--  Text starting with @ or # (if single, String can be used here)
                tagTextProp: 'title',  // <-- the default property (from whitelist item) for the text to be rendered in a tag element.
                // Array for initial interpolation, which allows only these tags to be used
                whitelist: whitelist,
                dropdown: {
                    maxItems: whitelist.length,           // <- mixumum allowed rendered suggestions
                    classname: "tags-look", // <- custom classname for this dropdown, so it could be targeted
                    enabled: 0,             // <- show suggestions on focus
                    closeOnSelect: true    // <- do not hide the suggestions dropdown once an item has been selected
                }
            });
        }

    });

    const handleInputChange = (e) => {
        props.onChange(e.target.value)
    }

    const returnData = (props.textbox) ? (
        <input
            type="text"
            id={props.id || "TagifyComponent"}
            name={props.name || "TagifyComponent"}
            className={props.className || ""}
            value={value}
            onChange={handleInputChange} />)

        : (
            <textarea
                id={props.id || "TagifyComponent"}
                name={props.name || "TagifyComponent"}
                className={props.className || ""}
                value={value}
                onChange={handleInputChange}></textarea>
        )

    return returnData;


}

export default TagifyComponent