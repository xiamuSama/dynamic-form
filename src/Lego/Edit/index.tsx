import React, { useCallback, useEffect, useState } from "react";
import { Button, Affix, Row, Col } from "antd";
import { PlusOutlined } from "@ant-design/icons";

import { BlockConfig } from "./types";
import BlockItem from "./BlockItem";
import { defaultBlockItem, TplSchema } from "../mock";

import "./index.css";

const Edit = () => {
  const scene = "Test";
  const [blocks, setBlocks] = useState<BlockConfig[]>([]);
  const handleSave = useCallback(() => {
    const payload = {
      scene,
      sceneDesc: "普通设备模板创建",
      blocks,
    };
    console.log(11, payload);
  }, [scene]);

  const toAdd = useCallback(() => {
    setBlocks((v: BlockConfig[]) => {
      v.push({ ...defaultBlockItem });
      return ([] as BlockConfig[]).concat(v);
    });
  }, [scene]);

  useEffect(() => {
    setBlocks(JSON.parse(JSON.stringify(TplSchema.blocks)));
  }, []);

  return (
    <div className={"legoMain"}>
      <Affix offsetTop={50}>
        <div className={"container"}>
          <div className={"titleBox"}>
            <span className={"title"}>编辑表单</span>
          </div>
          <Button type="primary" onClick={handleSave}>
            保存
          </Button>
        </div>
      </Affix>
      <div>
        <Button
          type={"dashed"}
          onClick={toAdd}
          icon={<PlusOutlined />}
          className={"addButton"}
        >
          新建表单区块
        </Button>
        <Row gutter={24}>
          {blocks?.map((v, index) => (
            <Col span={v.span} key={index}>
              <BlockItem
                config={v}
                setBlocks={setBlocks}
                queque={index}
                blockLength={blocks.length}
                // changeField={changeField}
              />
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
};

export default Edit;
