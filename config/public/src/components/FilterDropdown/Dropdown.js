import React, { Component } from 'react';
import {Input} from 'reactstrap';

class Dropdown extends Component {
    constructor() {
        super();
        this.state = { 
            items:['All', 'meet','Zoom', 'team'
            ]
        }
    }


    componentDidMount() {
        let initialItems = [];
            fetch()
            .then (response => {
                return response.json();
            }).then(data => {
                initialItems = data.results.map((item) => {
                    return item
                });
                console.log(initialItems);
                this.setState({
                    items: initialItems,
                });
            });
        }
    //  createSelectItems() {
    //     let items = [];         
    //     for (let i = 0; i <= this.props.maxValue; i++) {             
    //          items.push(<option key={i} value={i}>{i}</option>);   
             //here I will be creating my options dynamically based on
             //what props are currently passed to the parent component
    //     }
    //     return items;
    // }  

    // onDropdownSelected(e) {
    //     console.log("THE VAL", e.target.value);
        //here you will see the current selected value of the select input
    // }


    render() { 
        let items = this.state.items;
        let optionItems = items.map((item) => 
            <option key={item.name}>{item.name}</option>
        )
            
        return ( 
            <React.Fragment>
                <select>
                    {optionItems}
                </select>
                 {/* <Input type="select" onChange={this.onDropdownSelected} label="Multiple Select" multiple>
                    {this.createSelectItems()}  
                 </Input> */}
            </React.Fragment>
         );
    }
}
 
export default Dropdown;