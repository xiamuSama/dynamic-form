import ForbiddenRule from './ForbiddenRule';

const componentMap = {
    ForbiddenRule: ForbiddenRule,
};

const getCustomComponent = (component: string) => {
    return componentMap[component];
};

export default getCustomComponent;
