import ForbiddenRule from './ForbiddenRule';

const componentMap = {
    ForbiddenRule: ForbiddenRule,
};

export const getCustomComponent = (component: string) => {
    return componentMap[component];
};

/**
 *
 * @param name 保证全局唯一: 会出现namespace重复问题
 * @param component
 */
export const registerComponent = (name: string, component: React.ReactNode) => {
    if (!componentMap[name]) {
        componentMap[name] = component;
    }
};

export const unmountCustomCompoent = (name: string | string[]) => {
    if (typeof name === 'string') {
        componentMap[name] = undefined;
    } else {
        name?.forEach(key => {
            componentMap[key] = undefined;
        });
    }
};
