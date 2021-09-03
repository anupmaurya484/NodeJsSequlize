import React, { useState } from 'react';
import Autocomplete from 'react-autocomplete';
//Action 
import { AutocompleteData } from '../../actions/admin';

const AutoCompleteInput = (props) => {
    const [values, setValues] = useState("");

    const renderItem = (item, isHighlighted) => {
        return (
            <div className="autocomplete-list">
                Testing
            </div>
        )
    }

    const onChange = async (e) => {
        // await AutocompleteData
        console.log(e.target.value);
        if (e.target.value.length >= 3) {
            AutocompleteData('GetUserList').then(data => {
                console.log(data);
            })
        }
        setValues(e.target.value)
    }
    return (
        <>
            <label>Email</label>
            <div className="autocomplete-input">
                <Autocomplete
                    items={[]}
                    renderItem={renderItem}
                    name='itemList'
                    value={values}
                    onChange={onChange}
                    onSelect={(val) => console.log(val)}
                />
            </div>
        </>
    )

}
export default AutoCompleteInput;