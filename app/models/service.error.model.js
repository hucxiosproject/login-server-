/**
 * Created by lvshun on 15/10/14.
 */
export function ServiceError(code,message) {
  return {
    status:code,
    message:message
  };
}