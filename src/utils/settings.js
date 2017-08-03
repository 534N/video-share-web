let CLOUD_VMS_HOST_NAME = 'https://cloudvms.solinkcloud.com';

if (process.env.REACT_APP_NODE_ENV === 'integration') {
  CLOUD_VMS_HOST_NAME = 'https://int-cloudvms.solinkcloud.com';
}

export default Object.assign({}, {
  cloud_vms_host: CLOUD_VMS_HOST_NAME,
});