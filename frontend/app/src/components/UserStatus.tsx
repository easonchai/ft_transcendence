import { Badge } from "antd"
import { useContext } from "react"
import { AppContext } from "./Layout"

const UserStatus = (props: { id: string }): JSX.Element => {
	const context = useContext(AppContext);
	
	for (const a of context.onlineClients) {
		if (a.user_id === props.id) {	
			return <Badge status={a.status === 'ONLINE' ? 'success' : 'warning'}/>
		} 
	}
	return <Badge status='error'/>
}

export default UserStatus