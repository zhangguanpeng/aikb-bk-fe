/**
 * @see https://umijs.org/zh-CN/plugins/plugin-access
 * */
import { getCookie } from '@/utils';

export default function access(initialState: { currentUser?: API.CurrentUser } | undefined) {
  // console.log('initialState', initialState);
  const { currentUser } = initialState ?? {};
  console.log('currentUser', currentUser);
  return {
    canAdmin: (currentUser && currentUser.access === 'admin') || getCookie('username') === 'admin',
  };
}
