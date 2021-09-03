
import React, { Component } from 'react';
import { Toast, isEmptyString } from '../../utils/helperFunctions';
import "./TagsInput.css";

const TagsInput = props => {
  let [tags, setTags] = React.useState(props.tags);
  
  const removeTags = indexToRemove => {
      setTags([...tags.filter((_, index) => index !== indexToRemove)]);
      props.selectedTags([...tags.filter((_, index) => index !== indexToRemove)]);
  };
  const addTags = event => {
      if (event.target.value !== "") {
        let isvalid = true;
          if(props.isEmailOrisPhone){
            var filter = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
            var phoneNum = /^\+[1-9]\d{1,14}$/;
            var isEmail = filter.test(event.target.value), isPhone = phoneNum.test(event.target.value);
            isvalid = (isEmail || isPhone) ? isvalid : false;
          }
          if(isvalid){
            setTags([...tags, event.target.value]);
            props.selectedTags([...tags, event.target.value]);
            event.target.value = "";
          }else{
            Toast("Please enter valid email address or mobile number.", "error");
          }
          
      }
  };
  return (
      <div className="tags-input">
          <ul id="tags">
              {tags.map((tag, index) => (
                  <li key={index} className="tag">
                      <span className='tag-title'>{tag}</span>
                      <span className='tag-close-icon'
                          onClick={() => removeTags(index)}
                      >
                          x
                      </span>
                  </li>
              ))}
          </ul>
          <input
              type="text"
              id= {props.id}
              readOnly = {props.readOnly}
              onKeyUp={event => event.key === "Enter" ? addTags(event) : null}
              placeholder="Press enter to add tags"
          />
      </div>
  );
};

export default TagsInput;
