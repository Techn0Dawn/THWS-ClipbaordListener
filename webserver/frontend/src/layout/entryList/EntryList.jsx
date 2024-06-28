import { Item, Segment } from "semantic-ui-react";

export default function EntryList({data} = Props) {

    return (
        <>
        <Segment>
          <Item.Group divided>
            {data.map((entry) => (
              <Item key={entry.id}>
                <Item.Content>
                  <Item.Header>Id: {entry.id}</Item.Header>
                  <Item.Description>
                    <div>
                      Stored Value: <b>{entry.value}</b>
                    </div>
                  </Item.Description>
                </Item.Content>
              </Item>
            ))}
          </Item.Group>
        </Segment>
      </>
    )
}