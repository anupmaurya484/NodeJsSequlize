import React, { Fragment, useState, useEffect } from 'react';
import { Form } from 'react-formio';
const PreviewFormio = props => {
    const previewSchema = localStorage.getItem('previewSchema');
    const formLanguage = localStorage.getItem('formLanguage');
    localStorage.setItem('previewSchemaLoad', true);
    let option = (formLanguage && formLanguage != "undefined") ? { language: JSON.parse(formLanguage).language, i18n: JSON.parse(formLanguage).i18n } : {}
    debugger
    return (
        <Form
            form={JSON.parse(previewSchema)}
            options={option}
            onSubmit={(e) => {
                console.log("onSubmit: ", e);
            }}
        />
    );
};

export default PreviewFormio;