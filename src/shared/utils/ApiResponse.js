class ApiResponse {
  constructor(statusCode, message = 'Success', data = null, pagination = null, meta = null) {
    this.success = statusCode < 400;
    this.message = message;
    
    if (data !== null) {
      this.data = data;
    }
    
    if (pagination) {
      this.pagination = pagination;
    }
    
    if (meta) {
      this.meta = meta;
    }
    
    this.statusCode = statusCode;
  }
}

module.exports = ApiResponse;
