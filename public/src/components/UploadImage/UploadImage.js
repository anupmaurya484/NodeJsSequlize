import React, { Component, PureComponent, createRef, Fragment } from 'react'
import { ModalBody, Modal, ModalHeader, ModalFooter } from "reactstrap";
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Link } from 'react-router-dom';
import './uploadImage.scss'


class UploadImage extends Component {
    state = {
        src: null,
        defaultImage: "",
        isCroped: false,
        crop: {
            unit: '%',
            width: 30,
            height: 30,
            aspect: 16 / 9
        },
    };

    componentDidMount() {
        this.setState({ company_logo: this.props.company_logo, defaultImage: this.props.company_logo })
    }

    onSelectFile = e => {
        console.log(e);
        e.preventDefault();
        if (e.target.files && e.target.files.length > 0) {
            const reader = new FileReader();
            this.setState({ filename: e.target.files[0].name })
            reader.addEventListener('load', () => {
                console.log(reader);
                this.setState({ src: reader.result, croppedImageUrl: e.target.files[0] })
            });
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    // If you setState the crop in here you should return false.
    onImageLoaded = image => {
        this.imageRef = image;
    };

    onCropComplete = crop => {
        this.makeClientCrop(crop);
    };

    onCropChange = (crop, percentCrop) => {
        // You could also use percentCrop:
        // this.setState({ crop: percentCrop });
        this.setState({ crop });
    };

    async makeClientCrop(crop) {
        if (this.imageRef && crop.width && crop.height) {
            const croppedImageUrl = await this.getCroppedImg(this.imageRef, crop, 'newFile.jpeg');
            console.log(croppedImageUrl);
            this.setState({ croppedImageUrl, isCroped: false, company_logo: this.fileUrl });
        }
    }

    getCroppedImg(image, crop, fileName) {
        const canvas = document.createElement('canvas');
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;
        canvas.width = crop.width;
        canvas.height = crop.height;
        const ctx = canvas.getContext('2d');

        ctx.drawImage(
            image,
            crop.x * scaleX,
            crop.y * scaleY,
            crop.width * scaleX,
            crop.height * scaleY,
            0,
            0,
            crop.width,
            crop.height
        );

        return new Promise((resolve, reject) => {
            canvas.toBlob(blob => {
                if (!blob) {
                    //reject(new Error('Canvas is empty'));
                    console.error('Canvas is empty');
                    return;
                }
                blob.name = fileName;
                window.URL.revokeObjectURL(this.fileUrl);
                this.fileUrl = window.URL.createObjectURL(blob);
                resolve(blob);
            }, 'image/jpeg');
        });
    }

    dataURLtoFile(dataurl, filename) {
        var arr = dataurl.split(','),
            mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]),
            n = bstr.length,
            u8arr = new Uint8Array(n);

        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }

        return new File([u8arr], filename, { type: mime });
    }

    render() {
        const { crop, src, defaultImage, isCroped, company_logo, croppedImageUrl } = this.state;

        return (
            <Modal isOpen={true} toggle={this.props.onClose}>
                <ModalHeader toggle={this.props.onClose}>Upload image</ModalHeader>
                <ModalBody >

                    <div>
                        <input type="file" accept="image/*" onChange={this.onSelectFile} />
                        {company_logo &&
                            <>
                                {/* {src && <button onClick={() => this.setState({ src: null, isCroped: true })} className="custom-btn header-admin-btn btn btn-primary btn-sm mb-3 float-right">Crop Image</button>} */}
                                {src && <button onClick={() => this.setState({ company_logo: defaultImage, filename: "", src: null })} className="mr-2 custom-btn header-admin-btn btn btn-primary btn-sm mb-3 float-right">Cancel</button>}
                                {(company_logo && company_logo != "") && <button onClick={this.props.onRemoveImage} className="mr-2 custom-btn header-admin-btn btn btn-primary btn-sm mb-3 float-right">Remove</button>}
                                {src && <button onClick={() => this.props.onUpdateImage(this.state.croppedImageUrl)} className="mr-2 custom-btn header-admin-btn btn btn-primary btn-sm mb-3 float-right">Save</button>}
                            </>
                        }
                    </div>

                    {(company_logo && !src) &&
                        <img style={{ width: "100%", height: "350px" }} src={company_logo} onError={(e) => { e.target.onerror = null; e.target.src = 'https://portal.glozic.com/assets/logo-small.png' }} alt="img" />
                    }

                    {(src) &&
                        <img style={{ width: "100%", height: "350px" }} src={src} onError={(e) => { e.target.onerror = null; e.target.src = 'https://portal.glozic.com/assets/logo-small.png' }} alt="img" />
                    }

                </ModalBody>
                <ModalFooter>
                    <span className="text-danger">Best size of 92 X 22</span>
                </ModalFooter>
            </Modal >
        );
    }
}

export default UploadImage;