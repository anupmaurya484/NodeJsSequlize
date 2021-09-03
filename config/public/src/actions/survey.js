import axios from '../utils/axiosService';
import * as TYPES from './types';

export const setSurveyCOllectersSuccess = (SurveyCollecterList) => {
	return {
		type: TYPES.SURVEY_COLLECTERS_LISTS_RESPONSE_SUCCESS,
		SurveyCollecterList
	};
}

export const setSurveyAnalysisSuccess = (SurveyAnalysis) => {
	return {
		type: TYPES.SURVEY_ANALYSIS_RESPONSE_SUCCESS,
		SurveyAnalysis
	};
}


export const saveServeyForm = (payload) => {
	return (dispatch) => {
		return axios.apis("PUT", "/api/addservey", payload)
			.then((res) => {
				return res;
			})
			.catch(e => console.error(e))
	}
}

export const ServeyList = () => {
	return (dispatch) => {
		return axios.apis("GET", "/api/serveyList")
			.then((res) => {
				return res;
			})
			.catch(e => console.error(e))
	}
}

export const ServeyListSearch = (payload) => {
	return (dispatch) => {
		return axios.apis("POST", "/api/SurveyListSearch", payload)
			.then((res) => {
				return res;
			})
			.catch(e => console.error(e))
	}
}

export const getQuestionsData = (data) => {
	return (dispatch) => {
		return axios.apis("POST", "/api/getQuestionsData", data).then((res) => {
			return res;
		}).catch(e => console.error(e))
	}
}

export const ServeyDelete = (data) => {
	return (dispatch) => {
		return axios.apis("POST", "/api/serveyDelete", data).then((res) => {
			return res;
		}).catch(e => console.error(e))
	}
}
export const addSurveyResponse = (data) => {
	return (dispatch) => {
		return axios.apis("POST", "/api/addSurveyResponse", data)
			.then((res) => {
				return res;
			})
			.catch(e => console.error(e))
	}
}

export const GetSurveyResponse = (data) => {
	return (dispatch) => {
		return axios.apis("POST", "/api/getSurveyResponse", data)
			.then((res) => {
				return res;
			})
			.catch(e => console.error(e))
	}
}
export const GetSurveyResponseanswer = (data) => {
	return (dispatch) => {
		return axios.apis("POST", "/api/getSurveyResponseanswer", data).then((res) => {
			return res;
		}).catch(e => console.error(e))
	}
}

export const GetSurveyCollecter = (data) => {
	return (dispatch) => {
		return axios.apis("POST", "/api/getSurveyCollecter", data).then((res) => {
			if (res.status) {
				dispatch(setSurveyCOllectersSuccess(res.data));
			}
		}).catch(e => console.error(e))
	}
}

export const AddSurveyCollecter = (data) => {
	return (dispatch) => {
		return axios.apis("POST", "/api/addUpdateSurveyCollecter", data)
			.then((res) => {
				return res;
			})
			.catch(e => console.error(e))
	}
}

export const DeleteSurveyCollecter = (data) => {
	return (dispatch) => {
		return axios.apis("POST", "/api/deleteSurveyCollecter", data)
			.then((res) => {
				return res;
			})
			.catch(e => console.error(e))
	}
}

export const GetSurveyAnalysis = (data) => {
	return (dispatch) => {
		return axios.apis("POST", "/api/GetSurveyAnalysis", { id: data }).then((res) => {
				if (res.status) {
					dispatch(setSurveyAnalysisSuccess(res.data));
				}
			}).catch(e => console.error(e))
	}
}