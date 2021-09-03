import React, { Component } from 'react'
import { Form } from 'react-formio';
import { dataURLtoBlob, getBase64Url } from '../../utils/helperFunctions';
import axios from '../../utils/axiosService';
import auth from "../../actions/auth";
import API from '../../config';
const apiUrl = API.API_URL;


const b64toBlob = (b64Data, contentType = '', sliceSize = 512) => {
    const byteCharacters = window.atob(b64Data);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        const slice = byteCharacters.slice(offset, offset + sliceSize);

        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }

        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
    }

    const blob = new Blob(byteArrays, { type: contentType });
    return blob;
}


class FormioInput extends Component {
    constructor(props) {
        super(props)
        this.state = {
            selectedItem: '',
            formschema: null,
            formOptions: null,
            submission: null,
        }
    }

    componentDidMount() {
        this.componentUpdate(this.props);
    }

    componentWillReceiveProps(props) {
        this.componentUpdate(props);
    }

    componentUpdate = async (props) => {
        const { formschema, formOptions, submission } = props;
        try {
            let SubhighlightedItems = [];
            var fields = Object.keys(submission.data);
            for (let i = 0; i < fields.length; i++) {
                let cell = submission.data[fields[i]];
                if (typeof cell == "object" && cell) {
                    for (let j = 0; j < cell.length; j++) {
                        if (cell[j].url && cell[j].contentType && cell[j].size) {
                            submission.data[fields[i]][j].url = await getBase64Url(`${apiUrl}/download?filename=${cell[j].filename}`)
                        } else {
                            var recodeLists = cell;
                            for (let s = 0; s < recodeLists.length; s++) {
                                var fields2 = Object.keys(recodeLists[s]);
                                for (let k = 0; k < fields2.length; k++) {
                                    let cell2 = recodeLists[s][fields2[k]];
                                    if (typeof cell2 == "object" && cell2) {
                                        for (let l = 0; l < cell2.length; l++) {
                                            if (cell2[l].url && cell2[l].size && cell2[l].contentType) {
                                                submission.data[fields[i]][s][fields2[k]][l]['url'] = `${apiUrl}/download?filename=${submission.data[fields[i]][s][fields2[k]][l].filename}`;
                                                SubhighlightedItems.push(submission.data[fields[i]][s][fields2[k]][l]);
                                            } else if (cell2[l].url) {
                                                const base64 = cell2[l].url.split(";base64,")[1];
                                                if (base64) {
                                                    const blob = b64toBlob(base64, submission.data[fields[i]][s][fields2[k]][l].type);
                                                    const blobUrl = URL.createObjectURL(blob);
                                                    submission.data[fields[i]][s][fields2[k]][l]['url'] = blobUrl;
                                                }
                                                SubhighlightedItems.push(submission.data[fields[i]][s][fields2[k]][l]);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            console.log(JSON.parse(JSON.stringify(submission)));
            this.setState({ formschema, formOptions, submission: submission });
            for (var i = 0; i < 5; i++) {
                setTimeout(() => {
                    const highlightedItems = document.querySelectorAll("a[href='#']")
                    highlightedItems.forEach(function (userItem) {
                        let item = SubhighlightedItems.find(x => x.originalName == userItem.innerText)
                        userItem.href = item ? item.url : userItem.href;
                    });
                }, 1000)
            }
        } catch (err) {
            console.log(err.message);
            this.setState({ formschema, formOptions, submission });
        }
    }


    submitFormFields = async (formData) => {
        let formFields = formData.data, redirectUrl = "";
        //console.log(formFields)
        var Objectkey = Object.keys(formFields)
        for (let i = 0; i < Objectkey.length; i++) {
            let key = Objectkey[i];
            if (formFields[key] && formFields[key].length && formFields[key].length > 0 && typeof formFields[key] == "object") {
                for (let j = 0; j < formFields[key].length; j++) {
                    if (formFields[key][j].url && formFields[key][j].url.search("base64") >= 0) {
                        var res_file = await this.uploadFile({ key: key, index: j, url: formFields[key][j].url, keyName: formFields[key][j].originalName.trim() });
                        formFields[key][j].url = res_file.filename;
                        formFields[key][j]['filename'] = res_file.filename;
                        formFields[key][j]['fileKey'] = res_file.fileKey;
                        formFields[key][j]['fileId'] = res_file.fileId;
                        formFields[key][j]['contentType'] = res_file.contentType;
                        formFields[key][j]['size'] = res_file.size;
                    } else {
                        debugger
                        var recodeLists = formFields[key];
                        for (let s = 0; s < recodeLists.length; s++) {
                            var fields2 = Object.keys(recodeLists[s]);
                            for (let k = 0; k < fields2.length; k++) {
                                let cell2 = recodeLists[s][fields2[k]];
                                if (typeof cell2 == "object" && cell2) {
                                    for (let l = 0; l < cell2.length; l++) {
                                        if (cell2[l].url && formFields[key][s][fields2[k]][l].url.search("base64") >= 0) {
                                            var res_file = await this.uploadFile({ key: key, index: j, url: formFields[key][s][fields2[k]][l].url, keyName: formFields[key][s][fields2[k]][l].originalName.trim() });
                                            formFields[key][s][fields2[k]][l].url = res_file.filename;
                                            formFields[key][s][fields2[k]][l]['filename'] = res_file.filename;
                                            formFields[key][s][fields2[k]][l]['fileKey'] = res_file.fileKey;
                                            formFields[key][s][fields2[k]][l]['fileId'] = res_file.fileId;
                                            formFields[key][s][fields2[k]][l]['contentType'] = res_file.contentType;
                                            formFields[key][s][fields2[k]][l]['size'] = res_file.size;
                                        }
                                    }
                                }
                            }
                        }

                    }
                }
            }

            if (formFields[key] && typeof formFields[key] == "string" && redirectUrl != "") {
                redirectUrl = redirectUrl.replace("<<" + key + ">>", formFields[key]);
                redirectUrl = redirectUrl.replace("<<submission." + key + ">>", formFields[key]);
                redirectUrl = redirectUrl.replace("<<data." + key + ">>", formFields[key]);
            }
        }

        this.props.submitFormFields({ formFields: formFields, redirectUrl: redirectUrl })
    }

    uploadFile = async (file) => {
        const that = this;
        let result = await new Promise(async function (resolve, reject) {
            const nameStartIdx = file.url.indexOf(';name=') + 6
            const nameEndIdx = file.url.indexOf(';base64,')
            const filename = file.url.slice(nameStartIdx, nameEndIdx)

            const sBoundary = "---------------------------" + Date.now().toString(16)

            var date = new Date();
            const formFile = new FormData();
            formFile.append("file", dataURLtoBlob(file.url), filename.trim().replace("%", ''))

            // upload attachment file
            const config = {
                headers: {
                    'content-type': `multipart/form-data; boundary=${sBoundary}`,
                    'Authorization': auth.headers.headers.Authorization,
                },
                onUploadProgress: progressEvent => {
                    const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
                    that.setState({
                        totalSize: progressEvent.total,
                        clientUploadProgress: progress
                    })
                }
            }

            try {
                var res = await axios.apis('POST', `/api/upload`, formFile)
                const { filename, fileId, contentType, size, message } = res
                resolve({ res: "0", filename: filename, fileKey: file.keyName, fileId, contentType, size, ...file });
            } catch (err) {
                console.log(err.message);
                resolve({ res: "1", filename: null })
            }
        });
        return result;
    }

    render() {
        const { formschema, formOptions, submission } = this.state
        if (!formschema && !formOptions && !submission) return false;
        return (
            <Form
                form={formschema}
                options={formOptions}
                submission={submission}
                onChange={(e) => console.log('e.data')}
                onSubmit={(e) => this.submitFormFields(e)}
                onCustomEvent={this.props.onCustomEvent}
            />
        )
    }
}


export default FormioInput